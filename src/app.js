import express from 'express';
import ProductManager from '../ProductManager.js';
import router from './routes/usersRouter.js';

const productManager = new ProductManager('../products.json');
const app = express();
const port = 8080;

//Middlewares

//Routes
app.use("/api/main/", router);
app.use("/api/products/", productsRouter);
app.use("/api/users/", usersRouter);


app.listen(port, () => {
    console.log("Servidor corriendo en el puerto: ", port);
});

app.get('/products', async (request, response) => {
    try{
        const limit = request.query.limit;
        const products = await productManager.getProducts();

        if(limit) {
            response.json(products.slice(0, parseInt(limit)));
        } else {
            response.json(products);
        }
    } catch (error) {
        response.status(500).json({ error: error.message });
    } 
});

app.get('/products/:pid', async (request, response) => {
    try{
        const productId = parseInt(request.params.pid);
        const product = await productManager.getProductsById(productId);

        if(product) {
            response.json(product);
        } else {
            response.status(400).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});
