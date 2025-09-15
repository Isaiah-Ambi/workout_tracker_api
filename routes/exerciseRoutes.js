const { Router } = require('express');
const Exercise = require('../models/exerciseModel');
const { getAll, getOne } = require('../controllers/exerciseController');


const router = Router();

router.get('/', getAll);
router.get('/:id', getOne)


module.exports = router;