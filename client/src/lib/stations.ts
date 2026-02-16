export interface Station {
  id: string;
  name: string;
  genre: string;
  url: string;
  image: string;
  artworkLg: string;
  color: string;
}

export const STATIONS: Station[] = [
  {
    id: 'mirchi-nj',
    name: 'Radio Mirchi New Jersey',
    genre: 'Bollywood & Local',
    url: 'https://17653.live.streamtheworld.com/NJS_HIN_ESTAAC/HLS/playlist.m3u8',
    image: '/assets/stations/mirchi_nj.png',
    artworkLg: '/assets/stations/mirchi_nj_lg.png',
    color: 'bg-blue-600'
  },
  {
    id: 'zindagi-nj',
    name: 'Radio Zindagi New Jersey',
    genre: 'Desi Variety',
    url: 'https://us9.maindigitalstream.com/ssl/7417',
    image: '/assets/stations/zindagi.png',
    artworkLg: '/assets/stations/zindagi_lg.png',
    color: 'bg-green-600'
  },
  {
    id: 'mirchi-bayarea',
    name: 'Radio Mirchi Bay Area',
    genre: 'Bollywood & Bay',
    url: 'https://17853.live.streamtheworld.com/SFO_HIN_PSTAAC/HLS/playlist.m3u8',
    image: '/assets/stations/mirchi_bayarea.png',
    artworkLg: '/assets/stations/mirchi_bayarea_lg.png',
    color: 'bg-teal-600'
  },
  {
    id: 'mirchi-dubai',
    name: 'Radio Mirchi Dubai',
    genre: 'Bollywood Hits',
    url: 'https://27753.live.streamtheworld.com/DUB_HIN_GSTAAC/HLS/playlist.m3u8',
    image: '/assets/stations/mirchi_dubai.png',
    artworkLg: '/assets/stations/mirchi_dubai_lg.png',
    color: 'bg-sky-600'
  },
  {
    id: 'city-1016',
    name: 'City 1016',
    genre: 'UAE No. 1 Bollywood',
    url: 'https://n09.radiojar.com/gmwyu8xdrxquv',
    image: '/assets/stations/city_1016.jpg',
    artworkLg: '/assets/stations/city_1016_lg.jpg',
    color: 'bg-red-600'
  },
  {
    id: 'city-dil-se',
    name: 'City Dil Se FM',
    genre: 'Retro Bollywood',
    url: 'https://arn.itp.com/citydilse',
    image: '/assets/stations/city_dil_se.jpg',
    artworkLg: '/assets/stations/city_dil_se_lg.jpg',
    color: 'bg-rose-500'
  },
  {
    id: 'big-fm-int',
    name: 'Big FM International 104.9',
    genre: 'Global Desi Hits',
    url: 'http://sc-bb.1.fm:8017/',
    image: '/assets/stations/bigfm_int.png',
    artworkLg: '/assets/stations/bigfm_int_lg.png',
    color: 'bg-blue-500'
  },
  {
    id: 'mirchi-983',
    name: 'Radio Mirchi 98.3 FM',
    genre: 'India Original',
    url: 'https://eu8.fastcast4u.com/proxy/clyedupq?mp=%2F1?aw_0_req_lsid=2c0fae177108c9a42a7cf24878625444',
    image: '/assets/stations/mirchi_983.webp',
    artworkLg: '/assets/stations/mirchi_983_lg.webp',
    color: 'bg-orange-500'
  },
  {
    id: 'big-fm-927',
    name: '92.7 Big FM',
    genre: 'Dhun Badal Ke Toh Dekho',
    url: 'http://radios.crabdance.com:8002/2',
    image: '/assets/stations/bigfm_927.webp',
    artworkLg: '/assets/stations/bigfm_927_lg.webp',
    color: 'bg-cyan-600'
  },
  {
    id: 'red-fm-935',
    name: 'Red FM 93.5',
    genre: 'Bajaate Raho!',
    url: 'https://stream.zeno.fm/9phrkb1e3v8uv',
    image: '/assets/stations/redfm_935.webp',
    artworkLg: '/assets/stations/redfm_935_lg.webp',
    color: 'bg-red-700'
  },
  {
    id: 'goldy-evergreen',
    name: 'Goldy Evergreen',
    genre: 'Network Dholera Bhai',
    url: 'https://stream.zeno.fm/n2fd0edh9k8uv',
    image: '/assets/stations/goldy_evergreen.jpg',
    artworkLg: '/assets/stations/goldy_evergreen_lg.jpg',
    color: 'bg-yellow-700'
  },
  {
    id: 'goldy-fresh',
    name: 'Goldy Fresh',
    genre: 'Network Dholera Bhai',
    url: 'https://stream.zeno.fm/5qp76a5h3p8uv',
    image: '/assets/stations/goldy_fresh.jpg',
    artworkLg: '/assets/stations/goldy_fresh_lg.jpg',
    color: 'bg-green-700'
  },
  {
    id: 'aakashvani-guj',
    name: 'Aakashvani Gujarati',
    genre: 'All India Radio',
    url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio135/chunklist.m3u8',
    image: '/assets/stations/aakashvani_guj.jpg',
    artworkLg: '/assets/stations/aakashvani_guj_lg.jpg',
    color: 'bg-amber-600'
  }
];
