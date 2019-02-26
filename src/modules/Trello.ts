export type TrelloBoard = {
  id: string;
  name: string;
  desc: string;
  url: string;
  shortUrl: string;
  lists: Array<TrelloList>;
  cards: Array<TrelloCard>;
};

export type TrelloList = {
  id: string;
  idBoard: string;
  name: string;
};

export type TrelloCard = {
  id: string;
  idBoard: string;
  idList: string;
  name: string;
  desc: string;
};
