

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Tasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch tasks on component mount
  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const response = await fetch(`${API_URL}/api/task`);
      const jsonData = await response.json();
      setAllTasks(jsonData);
    } catch (err) {
      console.error(err.message);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {  
    e.preventDefault();
    if (title.trim() === '') {
      toast.warning('Please enter a task title');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const body = { title, description };
      const response = await fetch(`${API_URL}/api/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const newTask = await response.json(); 
      setAllTasks([newTask, ...allTasks]);
      setTitle('');
      setDescription('');
      toast.success('Task added successfully!');
    } catch(err) {
      console.log(err.message);
      toast.error('Failed to add task');
    }
  };

  const markAsDone = async (taskId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const numericId = Number(taskId);
      if (isNaN(numericId)) {
        throw new Error('Invalid task ID');
      }
  
      const response = await fetch(`${API_URL}/api/task/${numericId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Update failed');
      }
  
      // Update the task in state
      setAllTasks(allTasks.map(task => 
        task.id === numericId ? {
          ...task,
          status: 'completed',
          completed_at: data.completed_at || new Date().toISOString()
        } : task
      ));
  
      toast.success('Task completed successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(`Error: ${err.message}`);
    }
  };

  // Get all pending tasks sorted by creation date (newest first)
  const pendingTasks = allTasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Always show exactly 5 pending tasks (or less if not enough exist)
  const displayTasks = pendingTasks.slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Task Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Task Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Task Creation</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {pendingTasks.length} pending
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (pendingTasks.length / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New Task</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:border-blue-500 outline-none transition"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:border-blue-500 outline-none transition"
                    placeholder="Add details about the task..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Add Task
                </button>
              </form>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Top 5 Pending Tasks</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {displayTasks.length} shown
                </span>
              </div>

              {displayTasks.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No pending tasks!</h3>
                  <p className="text-gray-400 text-sm">Add new tasks to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayTasks.map(task => (
                    <div 
                      key={task.id}
                      className="group p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{task.title}</h3>
                          {task.description && (
                            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                          )}
                          <div className="text-xs text-gray-400">
                            Created: {new Date(task.created_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => markAsDone(task.id)}
                          className="ml-4 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors duration-200 flex items-center text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;