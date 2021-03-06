import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  webContents,
  BrowserView,
  dialog
} from 'electron';
// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).

import * as path from 'path'
import * as fs from 'fs'


import { uniqueId } from 'lodash'
import log from 'electron-log'

//import { DEVTOOLS } from '../common/electron-tabs/browserviewUtils'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow: BrowserWindow


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/index.ts
const createMainWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  const windowView = await createTabWindow()
  setTab(windowView)

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createMainWindow);


// https://github.com/wexond/browser-base/blob/master/src/main/index.ts

app.whenReady().then(() => {
  createMainWindow()
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});


app.on('web-contents-created', (e, contents) => {
  contents.on('new-window', (e, url) => {
    e.preventDefault();
    require('open')(url);
  });
  contents.on('will-navigate', (e, url) => {
    if (url !== contents.getURL()) e.preventDefault(), require('open')(url);
  });
});

app.on("before-quit", () => {
  log.info("Before quit")
});



ipcMain.handle('close-window', async (event, tabName: string) =>  {
  if (mainWindow) {
    mainWindow.close()
    mainWindow = null
  }
})

ipcMain.handle('minimum-window', async (event, tabName: string) => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.handle('toggle-maximum-window', async (event, tabName: string) => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
      return
    }
    mainWindow.maximize()
    return
  }
});


interface ITab {
  tabWindow: BrowserView;
  name: string;
}

let listTabWindows: ITab[] = []

interface ITabList {
  tabs: string[]
  active: string
}


const createTabWindow = async ( href?: string) => {

  console.log("createTabWindow called")

  // Create the browser view
  const tabWindow = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      disableDialogs: false,
      safeDialogs: true
    }
  })

  listTabWindows.push({
    tabWindow,
    name: uniqueId('Tab')
  })

  tabWindow.webContents.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  mainWindow.webContents.send('tab-change', getTabData())

  return tabWindow
}

const getTabData = (): ITabList => {
  return {
    tabs: listTabWindows.map((instance) => instance.name),
    active: listTabWindows.find((instance) => instance.tabWindow.webContents.id === mainWindow.getBrowserView()?.webContents?.id)?.name || ''
  }
} 

function sayHello() {
  console.log('You clicked me!');
  window.api.send('say-hello','')
}

const setTab = (instance: BrowserView) => {
  mainWindow.setBrowserView(instance)
  instance.setBounds({ x : 0, y: 36, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - 36 })
  instance.setAutoResize({ width: true, height: true, horizontal: false, vertical: false })
  mainWindow.webContents.send('tab-change', getTabData())

  mainWindow.webContents.focus()

  // https://www.geeksforgeeks.org/dynamically-execute-javascript-in-electronjs/

  mainWindow.webContents.executeJavaScript(`
    alert("HELLOOOOO")
  `)

  ipcMain.on('say-hello', (event, args) => {

      mainWindow.webContents.executeJavaScript(`console.log("HALOOOOOOOOOOOOOOOOOOOOO")`)
      .then((result) => {
        console.log(result) // Will be the JSON object from the fetch call
      })
  })

}

const newTab = async () => {
  const nt = await createTabWindow(mainWindow.getBrowserView()?.webContents.getURL());
  setTab(nt)
}

ipcMain.handle('new-tab', async (event, href: string) => {
  await newTab()
})

ipcMain.handle('set-tab', async (event, tabName: string) => {
  setTab(listTabWindows.find(instance => instance.name === tabName).tabWindow || listTabWindows[0].tabWindow)
})


ipcMain.handle('get-tabs', async (event, href: string) => {
  const data: ITabList = getTabData()
  mainWindow.webContents.send('get-tabs-from-main', data)
})

const destroyBrowserView = (bw: BrowserView) => {
  (bw.webContents as any).destroy()
}

const closeTab = (tabName: string) => {
  log.verbose(`Try to close tab ${tabName}`);
  const closeInstance = listTabWindows.find(instance => instance.name === tabName);
  if (closeInstance) {
    const currentState = getTabData();
    const closeIndex = listTabWindows.findIndex(instance => instance === closeInstance);

    let tabToClose = listTabWindows.filter(instance => instance.name === tabName)
    let bwToDestroy: BrowserView = tabToClose[0].tabWindow
    destroyBrowserView(bwToDestroy)

    listTabWindows = listTabWindows.filter(instance => instance.name !== tabName); // Update the list

    if (listTabWindows.length === 0) {
      mainWindow.close();
      mainWindow = null;
      return;
    }
    mainWindow.webContents.send('tab-change', getTabData());
    mainWindow.webContents.send('call-to-get-tabs', 'call-getInitTab')

    return;
  }
}

const getActiveInstance = () => {
  const data = getTabData()
  return listTabWindows.find(instance => instance.name === data.active)
}



ipcMain.handle('close-tab', (event, tabName: string) => {
  closeTab(tabName)
})

app.on('web-contents-created', (e, contents) => {
  contents.on('new-window', (e, url) => {
    e.preventDefault()
    require('open')(url)
  })
})

app.on('new-window-for-tab', () => {
  if (listTabWindows[0]?.tabWindow) {
    createTabWindow(listTabWindows[0]?.tabWindow.webContents.getURL())
  }
})
