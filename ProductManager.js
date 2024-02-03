import fs from 'fs';

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
        try{
            let listOfProducts = await this.loadProductsFromFile();
            const indexToDelete = listOfProducts.findIndex(product => product.id === id);
            
            if(indexToDelete !== -1) {
                listOfProducts = listOfProducts.filter(product => product.id !== id);
                await this.saveProductsToFile(listOfProducts);

                console.log("Producto eliminado correctamente");
            } else {
                console.error("No se pudo eliminar porque no se encontró un producto con ese ID");
            } 
        }catch (error) {
            console.error("Error al intentar eliminar el producto:", error.message);
        } 
    }

    async saveProductsToFile(products) {
        try{
            await fs.promises.writeFile(this.path, JSON.stringify(products || this.products, null, 2));
        } catch (error) {
            throw new Error("Hubo un error al guardar los productos en el archivo.");
        }    
    }

    async loadProductsFromFile() {
        try{
            const fileContent = await fs.promises.readFile(this.path, 'utf-8');
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

//PROCESO DE TESTING

//1. Se crea una instancia de la clase ProductManager
const productManager = new ProductManager(filePath);

//2. Se llama a getProducts, devuelve un array vacio
(async () => {
    try{
        const existingProducts = await productManager.getProducts();
        if (Array.isArray(existingProducts) && existingProducts.length === 0) {
            console.log('No hay productos en la lista.');
        } else {
            console.error('Hay productos existentes en la lista.');
        }
    } catch (error) {
        console.error("Error al ejecutar la prueba:", error.message);
    }
})();

//3. Se llama al método addProduct con los campos
const productToAdd = {
    title: "producto prueba", 
    description: "este es un producto prueba", 
    price: 200, 
    thumbnail: "sin imagen", 
    code: "abc123", 
    stock: 25   
}

const result = await productManager.addProduct(productToAdd);
console.log(result);

//4. Llamo al método getProducts y aparece el producto recién agregado
const productsAfterAdd = await productManager.getProducts();
console.log(productsAfterAdd);

//5. Llamo al método getProductsById y se corrobora que devuelva el producto
//con el id especificado. Si no existe, arroja un error
const productAdded = await productManager.getProductsById(result.id);
if(productAdded) {
    console.log("Producto encontrado por ID;", productAdded);
} else {
    console.error("Error: No se encontró el producto por el ID");
}

//6. Llamo al método updateProduct e intento cambiar un campo de algún producto.
// Evaluo que no se elimine el id y que sí se haya hecho la actualización.
const productIdToUpdate = 1;
const updatedFields = {price: 500};

try{
    await productManager.updateProduct(productIdToUpdate, updatedFields);
    const updatedProduct = await productManager.getProductsById(productIdToUpdate);
    
    if (updatedProduct) {
        console.log("Producto actualizado con éxito:", updatedProduct);
    } else {
        console.error("Error, no se encontró el producto con el ID especificado.");
    }
    
} catch (error) {
    console.error("Error al intentar actualizar el producto:", error.message);
}

//7. Llamo al método deleteProduct y se evalua que se elimine el producto o que arroje error
// en caso de no existir
const productIdToDelete = 1;

try{
    await productManager.deleteProduct(productIdToDelete);

    const deletedProduct = await productManager.getProductsById(productIdToDelete);

    if (!deletedProduct){
        console.log("Producto eliminado exitosamente.");
    } else {
        console.error("Error al intentar eliminar el producto.")
    }

} catch (error) {
    console.error("Error al intentar eliminar el producto:", error.message);
}


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