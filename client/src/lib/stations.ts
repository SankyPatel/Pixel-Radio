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
    id: 'mirchi-nj',
    name: 'Radio Mirchi New Jersey',
    genre: 'Bollywood & Local',
    url: 'http://76.164.217.100:7201/',
    image: '/assets/stations/mirchi_nj.png',
    color: 'bg-blue-600'
  },
  {
    id: 'zindagi-nj',
    name: 'Radio Zindagi New Jersey',
    genre: 'Desi Variety',
    url: 'http://76.164.217.100:7481/',
    image: '/assets/stations/zindagi.png',
    color: 'bg-green-600'
  },
  {
    id: 'mirchi-dubai',
    name: 'Radio Mirchi Dubai',
    genre: 'Bollywood Hits',
    url: 'http://peridot.streamguys.com:7150/Mirchi',
    image: '/assets/stations/mirchi_dubai.png',
    color: 'bg-sky-600'
  },
  {
    id: 'city-1016',
    name: 'City 1016',
    genre: 'UAE No. 1 Bollywood',
    url: 'http://sc-bb.1.fm:8017/',
    image: '/assets/stations/city_1016.jpg',
    color: 'bg-red-600'
  },
  {
    id: 'city-dil-se',
    name: 'City Dil Se FM',
    genre: 'Retro Bollywood',
    url: 'http://prclive1.listenon.in:8812/',
    image: '/assets/stations/city_dil_se.jpg',
    color: 'bg-rose-500'
  },
  {
    id: 'big-fm-int',
    name: 'Big FM International 104.9',
    genre: 'Global Desi Hits',
    url: 'http://prclive1.listenon.in:8824/',
    image: '/assets/stations/bigfm_int.webp',
    color: 'bg-blue-500'
  },
  {
    id: 'mirchi-983',
    name: 'Radio Mirchi 98.3 FM',
    genre: 'India Original',
    url: 'http://radios.crabdance.com:8002/1',
    image: '/assets/stations/mirchi_983.webp',
    color: 'bg-orange-500'
  },
  {
    id: 'big-fm-927',
    name: '92.7 Big FM',
    genre: 'Dhun Badal Ke Toh Dekho',
    url: 'http://radios.crabdance.com:8002/2',
    image: '/assets/stations/bigfm_927.webp',
    color: 'bg-cyan-600'
  },
  {
    id: 'red-fm-935',
    name: 'Red FM 93.5',
    genre: 'Bajaate Raho!',
    url: 'http://radios.crabdance.com:8002/3',
    image: '/assets/stations/redfm_935.webp',
    color: 'bg-red-700'
  }
];
