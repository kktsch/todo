import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import './App.css'
import { 
  fetchLists, 
  createList, 
  updateList, 
  deleteList,
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTaskName,
  updateTodoOrder
} from './services/DataService'

interface Todo {
  id: number;
  listId: number;
  text: string;
  completed: boolean;
  order: number;
}

interface List {
  id: number;
  title: string;
  createdAt: string;
  order?: number;
}

interface MenuPosition {
  top: number;
  left: number;
}

function App() {
  const [lists, setLists] = useState<List[]>([])
  const [todos, setTodos] = useState<{ [key: number]: Todo[] }>({})
  const [newListTitle, setNewListTitle] = useState('')
  const [newTodoTexts, setNewTodoTexts] = useState<{ [key: number]: string }>({})
  const [editingListId, setEditingListId] = useState<number | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<{ listId: number | null, todoId: number | null }>({ listId: null, todoId: null })
  const [newName, setNewName] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState<{ listId: number | null, todoId: number | null }>({ listId: null, todoId: null })
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 })

  useEffect(() => {
    const loadLists = async () => {
      try {
        const listsData = await fetchLists()
        setLists(listsData)
        
        const todosData: { [key: number]: Todo[] } = {}
        for (const list of listsData) {
          const listTodos = await fetchTodos(list.id)
          todosData[list.id] = listTodos
        }
        setTodos(todosData)
      } catch (error) {
        console.error(error)
      }
    }
    loadLists()
  }, [])

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newListTitle.trim() === '') return
    try {
      const newList = await createList(newListTitle)
      setLists([...lists, newList])
      setTodos({ ...todos, [newList.id]: [] })
      setNewListTitle('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateList = async (id: number, newTitle: string) => {
    try {
      const updatedList = await updateList(id, newTitle)
      setLists(lists.map(list => list.id === id ? updatedList : list))
      setEditingListId(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteList = async (id: number) => {
    try {
      await deleteList(id)
      setLists(lists.filter(list => list.id !== id))
      const newTodos = { ...todos }
      delete newTodos[id]
      setTodos(newTodos)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddTodo = async (listId: number, e: React.FormEvent) => {
    e.preventDefault()
    const text = newTodoTexts[listId]
    if (!text || text.trim() === '') return
    try {
      const addedTodo = await addTodo(listId, text)
      setTodos({
        ...todos,
        [listId]: [...(todos[listId] || []), addedTodo]
      })
      setNewTodoTexts({ ...newTodoTexts, [listId]: '' })
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleTodo = async (listId: number, todoId: number) => {
    try {
      const updatedTodo = await toggleTodo(listId, todoId)
      setTodos({
        ...todos,
        [listId]: todos[listId].map(todo => 
          todo.id === todoId ? updatedTodo : todo
        )
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateTaskName = async (listId: number, todoId: number, newText: string) => {
    try {
      const updatedTodo = await updateTaskName(listId, todoId, newText)
      setTodos({
        ...todos,
        [listId]: todos[listId].map(todo =>
          todo.id === todoId ? updatedTodo : todo
        )
      })
      setEditingTodoId({ listId: null, todoId: null })
      setIsMenuOpen({ listId: null, todoId: null })
    } catch (error) {
      console.error('Güncelleme sırasında bir hata oluştu.')
    }
  }

  const handleDeleteTodo = async (listId: number, todoId: number) => {
    try {
      await deleteTodo(listId, todoId)
      setTodos({
        ...todos,
        [listId]: todos[listId].filter(todo => todo.id !== todoId)
      })
      setIsMenuOpen({ listId: null, todoId: null })
    } catch (error) {
      console.error(error)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const [listId] = result.draggableId.split('-').map(Number);
    const items = Array.from(todos[listId]);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);
    
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setTodos({
      ...todos,
      [listId]: updatedItems
    });
    
    try {
      await updateTodoOrder(listId, movedItem.id, result.destination.index);
    } catch (error) {
      console.error('Sıralama güncellenirken hata oluştu:', error);
    }
  };

  const handleTodoMenuClick = (listId: number, todoId: number, event: React.MouseEvent) => {
    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: buttonRect.bottom + 5,
      left: buttonRect.right - 120
    });
    setIsMenuOpen({
      listId,
      todoId
    });
  };

  const handleListMenuClick = (listId: number, event: React.MouseEvent) => {
    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: buttonRect.bottom + 5,
      left: buttonRect.right - 120
    });
    setIsMenuOpen({
      listId,
      todoId: null
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen.listId !== null || isMenuOpen.todoId !== null) {
        const menuElement = document.querySelector('.menu-popup');
        const clickedElement = event.target as HTMLElement;
        
        if (menuElement && !menuElement.contains(clickedElement) && 
            !clickedElement.closest('.menu-button')) {
          setIsMenuOpen({ listId: null, todoId: null });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Listeler</h1>
        <form onSubmit={handleCreateList} className="list-form">
          <input
            type="text"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="Yeni liste başlığı..."
            className="list-input"
          />
          <button type="submit" className="primary-button">
            <span className="button-icon">+</span>
            Liste Oluştur
          </button>
        </form>
      </header>

      <div className="lists-container">
        {lists.map((list) => (
          <div key={list.id} className="list-card">
            <div className="list-header">
              {editingListId === list.id ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleUpdateList(list.id, newName)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateList(list.id, newName)
                    }
                  }}
                  className="edit-input"
                  autoFocus
                />
              ) : (
                <h2>{list.title}</h2>
              )}
              <button
                className="icon-button"
                onClick={(e) => handleListMenuClick(list.id, e)}
              >
                <span className="material-icons">more_vert</span>
              </button>
              {isMenuOpen.listId === list.id && isMenuOpen.todoId === null && (
                <div 
                  className="menu-popup"
                  style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`
                  }}
                >
                  <button className="menu-item" onClick={() => {
                    setEditingListId(list.id)
                    setNewName(list.title)
                    setIsMenuOpen({ listId: null, todoId: null })
                  }}>
                    <span className="material-icons">edit</span>
                    Düzenle
                  </button>
                  <button className="menu-item delete" onClick={() => handleDeleteList(list.id)}>
                    <span className="material-icons">delete</span>
                    Sil
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={(e) => handleAddTodo(list.id, e)} className="todo-form">
              <input
                type="text"
                value={newTodoTexts[list.id] || ''}
                onChange={(e) => setNewTodoTexts({
                  ...newTodoTexts,
                  [list.id]: e.target.value
                })}
                placeholder="Yeni görev ekle..."
                className="todo-input"
              />
              <button type="submit" className="secondary-button">
                <span className="material-icons">add_task</span>
              </button>
            </form>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`list-${list.id}`}>
                {(provided) => (
                  <div className="todo-list-container">
                    <ul
                      className="todo-list"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {todos[list.id]?.map((todo, index) => (
                        <Draggable
                          key={todo.id}
                          draggableId={`${list.id}-${todo.id}`}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`todo-item ${todo.completed ? 'completed' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleTodo(list.id, todo.id)}
                              />
                              {editingTodoId.listId === list.id && editingTodoId.todoId === todo.id ? (
                                <input
                                  type="text"
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  onBlur={() => handleUpdateTaskName(list.id, todo.id, newName)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateTaskName(list.id, todo.id, newName)
                                    }
                                  }}
                                  className="edit-input"
                                  autoFocus
                                />
                              ) : (
                                <div className="todo-content">
                                  <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                                    {todo.text}
                                  </span>
                                  {todo.completed && <span className="completion-icon">😊</span>}
                                </div>
                              )}
                              <div className="todo-actions">
                                <button
                                  className="menu-button"
                                  onClick={(e) => handleTodoMenuClick(list.id, todo.id, e)}
                                >
                                  ⋮
                                </button>
                                {isMenuOpen.listId === list.id && isMenuOpen.todoId === todo.id && (
                                  <div 
                                    className="menu-popup"
                                    style={{
                                      top: `${menuPosition.top}px`,
                                      left: `${menuPosition.left}px`
                                    }}
                                  >
                                    <button onClick={() => {
                                      setEditingTodoId({ listId: list.id, todoId: todo.id })
                                      setNewName(todo.text)
                                      setIsMenuOpen({ listId: null, todoId: null })
                                    }}>Düzenle</button>
                                    <button onClick={() => handleDeleteTodo(list.id, todo.id)}>Sil</button>
                                  </div>
                                )}
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App