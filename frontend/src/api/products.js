import client from "./client";

export async function getProducts() {
    const response = await client.get("/api/products");
    return response.data;
}

export async function getProductById(id) {
    const response = await client.get(`/api/products/${id}`);
    return response.data;
}

export async function createProduct(data) {
    const response = await client.post("/api/products", data);
    return response.data;
}

export async function updateProduct(id, data) {
    const response = await client.put(`/api/products/${id}`, data);
    return response.data;
}

export async function deleteProduct(id) {
    const response = await client.delete(`/api/products/${id}`);
    return response.data;
}