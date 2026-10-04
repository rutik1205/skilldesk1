const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_lGKXPbY/UNKPiTMc0R568/6J354=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_nsZkaUpnde8UZpx+QKe4BJsGxeg=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/ufabhqty5'
});

module.exports = imagekit;
