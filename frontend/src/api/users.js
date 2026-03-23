import client from "./client";

export async function getUsers() {
    const response = await client.get("/api/users");
    return response.data;
}

export async function getUserById(id) {
    const response = await client.get(`/api/users/${id}`);
    return response.data;
}

export async function updateUser(id, data) {
    const response = await client.put(`/api/users/${id}`, data);
    return response.data;
}

export async function blockUser(id) {
    const response = await client.delete(`/api/users/${id}`);
    return response.data;
}