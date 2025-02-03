const API_URL = import.meta.env.VITE_API_URL;

// Liste işlemleri
export const fetchLists = async () => {
  const response = await fetch(`${API_URL}/lists`);
  if (!response.ok) {
    throw new Error('Listeler alınamadı');
  }
  return response.json();
};

export const createList = async (title: string) => {
  const response = await fetch(`${API_URL}/lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Liste oluşturulamadı');
  }
  return response.json();
};

export const updateList = async (id: number, title: string) => {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Liste güncellenemedi');
  }
  return response.json();
};

export const deleteList = async (id: number) => {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Liste silinemedi');
  }
};

// Todo işlemleri
export const fetchTodos = async (listId: number) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos`);
  if (!response.ok) {
    throw new Error('Todo\'lar alınamadı');
  }
  return response.json();
};

export const addTodo = async (listId: number, text: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos`, {
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

export const toggleTodo = async (listId: number, id: number) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed: true }),
  });
  if (!response.ok) {
    throw new Error('Todo güncellenemedi');
  }
  return response.json();
};

export const updateTaskName = async (listId: number, id: number, newName: string) => {
  try {
    const response = await fetch(`${API_URL}/lists/${listId}/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newName }),
    });
    if (!response.ok) {
      throw new Error('Görev adı güncellenemedi');
    }
    return await response.json();
  } catch (error) {
    console.error('Görev adı güncellenirken hata:', error);
    throw error;
  }
};

export const deleteTodo = async (listId: number, id: number) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Todo silinemedi');
  }
};

export const updateTodoOrder = async (listId: number, id: number, newOrder: number) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order: newOrder }),
  });

  if (!response.ok) {
    throw new Error('Todo sıralaması güncellenemedi');
  }
  return response.json();
};