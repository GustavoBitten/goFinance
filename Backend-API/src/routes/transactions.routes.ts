import { Router } from 'express';
import CreateTransactionService from '../services/CreateTransactionService';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import uploadConfig from '../config/upload';
import multer from 'multer';
import ImportTransactionsService from '../services/ImportTransactionsService';


// import TransactionsRepository from '../repositories/TransactionsRepository';
// import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig)


transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactionsRepository = getCustomRepository(TransactionsRepository)
  
  const transactions = await transactionsRepository.find()
  
  const balance = await transactionsRepository.getBalance()

  return response.json( {transactions,balance})
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  const { title,value, type, category } = request.body

  const createTransactionService = new CreateTransactionService
  const transaction =  await createTransactionService.execute({title, value,type,category})

  return response.json(transaction) 
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const {id} = request.params
  
  const transactionsRepository = getCustomRepository(TransactionsRepository)

  const resultDelete = await transactionsRepository.delete(id)
  console.log(resultDelete)
  if(!resultDelete.affected){

    throw new AppError("Id not found");

  }

  return response.status(204).send()

});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  // TODO
  const importTransactionsService = new ImportTransactionsService()
  
  const importData = await importTransactionsService.execute(request.file.filename)
  const createTransactionService = new CreateTransactionService()

  let count = 0
  let list = []

  while (count < importData.length ) {

       const transaction = await createTransactionService.execute(importData[count])
       list.push(transaction)
       count ++

  }

  response.json(list)
});

export default transactionsRouter;
 