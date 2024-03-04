const express = require('express');
const asset = require('../controller/asset')
const {authenticateToken,authenticateTokenHead } = require('../auth');
const router = express.Router();
const multer = require('multer');
const {assetValidator} = require('../middleware/validator/asset.validator')


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.FILE_PATH);
    },
    filename: (req, file, cb) => {
      cb(null, new Date() + '-' + file.originalname);
    }
  });
  
const upload = multer({ storage: fileStorage });


router.get('/assetowned',authenticateToken,asset.assetOwned)
.post('/',authenticateTokenHead,assetValidator('addAsset'),asset.createAsset)
.get('/validateAssetId/:assetId',authenticateTokenHead,assetValidator('validateAssetId'),asset.assetIdValidation)
.put('/',authenticateTokenHead,assetValidator('editAsset'),asset.editAsset)
.put('/del',authenticateTokenHead,assetValidator('deleteAsset'),asset.deleteAsset)
.get('/:assetId',authenticateTokenHead,asset.getById)
.get('/category/:category',authenticateToken,asset.assetByCategory)
.post('/allocate',authenticateTokenHead,assetValidator('allocateAsset'),asset.allocateAsset)
.get('/ticketId/:assetId',authenticateTokenHead,asset.ticketByAssetId)
.get('/totalasset/:view',authenticateTokenHead,assetValidator('viewasset'),asset.viewAsset)
.get('/cat/:view',asset.viewAssetCategory)
.post('/csv',authenticateTokenHead,upload.single('csv'),asset.assetCsv)
.post('/expiry',asset.expiryNotification)
.post('/return/:ticketId',authenticateTokenHead,asset.returnAsset)
.post('/extend/:ticketId',authenticateTokenHead,assetValidator('extend'),asset.extendAsset)
.get('/assetIds/:asset',authenticateTokenHead,asset.allAssetIds)




module.exports = router;