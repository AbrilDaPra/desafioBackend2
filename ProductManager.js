const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.products = [];
        this.productIdCounter = 1;
        this.path = filePath;
    }

    async addProduct(product) {
        try {
            if(this.products.some(existingProduct => existingProduct.code === product.code)) {
                throw new Error ("Ya existe un producto con ese código.");
            }

            if(!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
                throw new Error ("Todos los campos deben ser completados.");
            }

            product.id = this.productIdCounter++;
            this.products.push(product);

            await this.saveProductsToFile();

            return "El producto fue agregado correctamente."

        } catch (error) {
            throw new Error("Hubo un error al intentar agregar el producto.");
        }
    }

    async getProducts() {
        this.products = await this.loadProductsFromFile();
        return this.products;
    }

    async getProductsById(id) {
        await this.loadProductsFromFile();

        const foundProduct = this.products.find(product => product.id === id);

        if(foundProduct) {
            return foundProduct;
        } else {
            return null;
        }
    }

    async updateProduct (id, updatedFields) {
        await this.loadProductsFromFile();

        const indexToUpdate = this.products.findIndex(product => product.id === id);

        if(indexToUpdate !== -1) {
            Object.assign(this.products[indexToUpdate], updatedFields);

            await this.saveProductsToFile();

            console.log("Producto actualizado correctamente.")
        } else {
            throw new Error("No se encontró un producto con el ID especificado.")
        }
    } 
    
    async deleteProduct(id) {
        let listOfProducts = this.loadProductsFromFile();

        const indexToDelete = listOfProducts.findIndex(product => product.id === id);
        
        if(indexToDelete !== -1) {
            listOfProducts = listOfProducts.filter(product => product.id !== id);
            await this.saveProductsToFile(listOfProducts);

            console.log("Producto eliminado correctamente");
        } else {
            console.error("No se pudo eliminar porque no se encontró un producto con ese ID");
        } 
    }

    async saveProductsToFile(products) {
        try{
            await fs.writeFile(this.path, JSON.stringify(products || this.products, null, 2));
        } catch (error) {
            throw new Error("Hubo un error al guardar los productos en el archivo.");
        }    
    }

    async loadProductsFromFile() {
        try{
            const fileContent = await fs.readFile(path, 'utf-8');
            if(fileContent) {
                const loadedProducts = JSON.parse(fileContent);
                return loadedProducts;
            }
        } catch (error) {
            throw new Error("Hubo un error al cargar los productos.");
        }
    }
}

const filePath = './products.json';
const productManager = new ProductManager(filePath);

const tshirt = await productManager.addProduct({
    title: "T-shirt", 
    description: "White cotton t-shirt", 
    price: 150, 
    thumbnail: "img1.jpg", 
    code: "A01", 
    stock: 200
});

const pants = await productManager.addProduct({
    title: "Pants", 
    description:"Blue jeans", 
    price: 200, 
    thumbnail: "img2.jpg", 
    code: "A002", 
    stock: 140
});

console.log(await productManager.getProducts());

const productFound = await productManager.getProductsById(1);
if (productFound) {
    console.log(productFound);
} else {
    console.error("Producto no encontrado.");
}

const productNotFound = await productManager.getProductsById(999);
if (productNotFound) {
    console.log(productNotFound);
} else {
    console.error("Producto no encontrado.");
}