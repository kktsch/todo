const API_URL = 'https://todo-2wt4.onrender.com/todos';

export const fetchTodos = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Todo\'lar alınamadı');
    }
    return response.json();
};

export const addTodo = async (text: string) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });
    if (!response.ok) {
        throw new Error('Todo eklenemedi');
    }
    return response.json();
};

export const toggleTodo = async (id: number) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
    });
    if (!response.ok) {
        throw new Error('Todo güncellenemedi');
    }
    return response.json();
};

export const deleteTodo = async (id: number) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Todo silinemedi');
    }
}; 