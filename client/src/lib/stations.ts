export interface Station {
  id: string;
  name: string;
  genre: string;
  url: string;
  image: string;
  color: string;
}

export const STATIONS: Station[] = [
  {
    id: '1',
    name: 'Radio Mirchi Tamil',
    genre: 'Tamil Hits',
    url: 'http://radios.crabdance.com:8002/1',
    image: '/assets/stations/station-1.png',
    color: 'bg-purple-500'
  },
  {
    id: '2',
    name: 'Suryan FM',
    genre: 'Chennai Vibes',
    url: 'http://radios.crabdance.com:8002/2',
    image: '/assets/stations/station-2.png',
    color: 'bg-orange-500'
  },
  {
    id: '3',
    name: 'NDTV India',
    genre: 'News & Talk',
    url: 'http://51.15.208.163:8081/radio/ndtv_india/icecast.audio',
    image: '/assets/stations/station-5.png',
    color: 'bg-red-500'
  },
  {
    id: '4',
    name: 'Mirchi Top 20',
    genre: 'Bollywood Hits',
    url: 'http://51.15.208.163:8081/radio/mt20live_11/icecast.audio',
    image: '/assets/stations/station-3.png',
    color: 'bg-blue-500'
  },
  {
    id: '5',
    name: 'Mohammed Rafi Radio',
    genre: 'Classic Bollywood',
    url: 'http://prclive1.listenon.in:8814/',
    image: '/assets/stations/station-4.png',
    color: 'bg-yellow-600'
  }
];
