export {} 

declare global {

  enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
  }

  interface ITabChangeList {
    tabs: string[];
    active: string;
  }


}
