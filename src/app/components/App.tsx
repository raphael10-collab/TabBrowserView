import React, { useEffect, useState, useMemo } from "react";
import { Tabs, TabList, Tab, TabPanel } from "@zendeskgarden/react-tabs";
import classNames from "classnames";

import { v4 as uuidv4 } from 'uuid'


import styled from 'styled-components'


// https://react.school/ui/input

// Styling a regular HTML input
const StyledInput = styled.input`
  display: block;
  margin: 20px 0px;
  border: 1px solid lightblue;
`;
// Creating a custom hook
function useInput(defaultValue) {
  const [value, setValue] = React.useState(defaultValue);
  function onChange(e) {
    setValue(e.target.value);
  }
  return {
    value,
    onChange,
  };
}

// https://react.school/ui/button

function sayHello() {
  console.log('You clicked me!');
  window.api.send('say-hello','')
}

const Button = styled.button`
  background-color: black;
  color: white;
  font-size: 20px;
  padding: 10px 60px;
  border-radius: 5px;
  margin: 150px 150px;
  cursor: pointer;
`



const App = () => {
  const [selectedTab, setSelectedTab] = useState("tab-1");
  const [tabList, setTabList] = useState<string[]>([]);

  interface ITabList {
    tabs: string[]
    active: string
  }

  const handleSelectTab = (tabName: string) => {
    if (tabName === "add") {
      window.api.electronIpcInvoke('new-tab', window.location.href)    
      return;
    }
    window.api.electronIpcInvoke('set-tab', tabName)
  };

  // https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/tab-preload.js
  // tab-preload.js : 
  //onTabChange: (cb) => {
    //ipcRenderer.on('tabChange', (event, tabList) => {
      //if (cb) {
        //cb(tabList);
      //}
    //})
    // Tabs.tsx :
    //window.api.onTabChange((data) => {
      //setTabList(data.tabs);
      //setSelectedTab(data.active);
    //});


  useEffect(() => {
    getInitTab();
    window.api.electronIpcOn('tab-change', (tabList) => {
      console.log("Tabs.tsx-window.api.electronIpcOn-tabChange-tabList: ", tabList)
      setSelectedTab(tabList.active)
    })

    window.api.electronIpcOn('call-to-get-tabs', (event, args) => {
      console.log("Tabs.tsx-electronIpcOn-call-to-get-tabs-args: ", args)

      window.api.electronIpcInvoke('get-tabs')

      window.api.electronIpcOn('get-tabs-from-main', (event, args) => {
        console.log("Tabs.tsx-call-to-get-tabs-get-tabs-from-main-args: ", args)
        setTabList(args.tabs)
        setSelectedTab(args.active)
      })

    })

  }, []);


  const getInitTab = async () => {
    //const data = await window.api.getTabs();
    window.api.electronIpcInvoke('get-tabs')
    window.api.electronIpcOn('get-tabs-from-main', (event, args) => {
      console.log("Tabs.tsx-electronIpcOn-get-tab-data-args: ", args)
      setTabList(args.tabs);
      setSelectedTab(args.active);
    })
  };

  const handleCloseTab = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    e.stopPropagation();

    window.api.electronIpcInvoke('close-tab', tab)
  };

  const handleCloseWindow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.api.electronIpcInvoke('close-window')
  };

  const handleMinimumWindow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    //window.api.minimumWindow();
    window.api.electronIpcInvoke('minimum-window')
  };

  const handleToggleMaximumWindow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    //window.api.toggleMaximumWindow();
    window.api.electronIpcInvoke('toggle-maximum-window')
  };

  const isMacOS = navigator.appVersion.indexOf("Mac") != -1;
  // const isMacOS = false;

  // srcSet="icons/min-w-10.png 1x, icons/min-w-12.png 1.25x, icons/min-w-15.png 1.5x, icons/min-w-15.png 1.75x, icons/min-w-20.png 2x, icons/min-w-20.png 2.25x, icons/min-w-24.png 2.5x, icons/min-w-30.png 3x, icons/min-w-30.png 3.5x"


  const inputProps = useInput("Search...")

  // <Button onClick={sayHello}>HelloButton</Button>

  return (
    <div className="flex flex-col h-screen">
      <div
        className={classNames("flex flex-row justify-between h-9", {
          ["mr-30"]: !isMacOS,
          ["ml-20"]: isMacOS,
        })}
        id="drag-title"
        onDoubleClick={handleToggleMaximumWindow}
      >
        <Tabs selectedItem={selectedTab} onChange={handleSelectTab}>
          <TabList
            className={classNames("box-content m-0 border-b-0", {
              ["bg-gray-500"]: !isMacOS,
              ["bg-gray-300"]: isMacOS,
            })}
          >
            {tabList.map((tab) => (
              <Tab
                item={tab}
                key={tab}
                className={classNames(
                  "py-2 px-8 border-0 text-left group relative",
                  {
                    ["bg-white"]: tab === selectedTab,
                    ["text-white"]: !isMacOS && tab !== selectedTab,
                    ["text-gray-600"]: isMacOS && tab !== selectedTab,
                  }
                )}
              >
                {tab}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="absolute transform -translate-y-1/2 opacity-0 right-2 top-1/2 group-hover:opacity-100"
                  onClick={(e) => handleCloseTab(e, tab)}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
                  />
                </svg>
              </Tab>
            ))}
            <Tab
              item="add"
              className={classNames("px-3 py-2 border-0", {
                ["text-white"]: !isMacOS,
                ["text-gray-600"]: isMacOS,
              })}
            >
              <svg
                width="18"
                height="20"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z" />
              </svg>
            </Tab>
          </TabList>


          {tabList.map((tab) => (
              <TabPanel item={tab} key={uuidv4()}>

                <Button onClick={sayHello}>HelloButton</Button>


              </TabPanel>
          ))}


        </Tabs>

        {!isMacOS && (
          <div className="flex flex-row items-stretch justify-center">
            <div
              className="p-3 hover:bg-gray-600"
              onClick={handleMinimumWindow}
            >
              <img
                className="icon"
                draggable="false"
              />
            </div>

            <div
              className="p-3 hover:bg-gray-600"
              onClick={handleToggleMaximumWindow}
            >
              <img
                className="icon"
                draggable="false"
              />
            </div>

            <div className="p-3 hover:bg-red-600" onClick={handleCloseWindow}>
              <img
                className="icon"
                draggable="false"
              />
            </div>
          </div>
        )}




      </div>
      <div className="w-full h-full bg-white"></div>
    </div>
  );
};

export default App;
