import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`),
        axios.get(`http://localhost:5000/api/tasks?project=${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        ...newTask,
        project: id,
      });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium' });
      fetchProjectAndTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (!project) return <div className="flex items-center justify-center h-full text-red-500">Project not found or unauthorized</div>;

  const columns = [
    { id: 'To Do', title: 'To Do', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800/50' },
    { id: 'In Progress', title: 'In Progress', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50/50 dark:bg-yellow-900/10' },
    { id: 'Done', title: 'Done', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50/50 dark:bg-green-900/10' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/projects" className="flex items-center gap-2 text-text-muted hover:text-text mb-2 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-text">{project.title}</h1>
          <p className="text-text-muted mt-1">{project.description}</p>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
        {columns.map(col => (
          <div key={col.id} className={`flex flex-col rounded-xl border border-gray-100 dark:border-gray-800 ${col.bg}`}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-background/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <col.icon className={`w-5 h-5 ${col.color}`} />
                <h3 className="font-semibold text-text">{col.title}</h3>
              </div>
              <span className="bg-surface text-text-muted text-xs font-bold px-2 py-1 rounded-full">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task._id} className="bg-background p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-text mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-text-muted mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                      task.priority === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                    }`}>
                      {task.priority}
                    </span>
                    
                    {/* Simple status mover for demonstration */}
                    <div className="flex gap-1">
                      {col.id !== 'To Do' && (
                        <button onClick={() => updateTaskStatus(task._id, col.id === 'Done' ? 'In Progress' : 'To Do')} className="text-xs text-text-muted hover:text-primary">&larr;</button>
                      )}
                      {col.id !== 'Done' && (
                        <button onClick={() => updateTaskStatus(task._id, col.id === 'To Do' ? 'In Progress' : 'Done')} className="text-xs text-text-muted hover:text-primary">&rarr;</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="text-center text-sm text-text-muted py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-text mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-text-muted hover:bg-surface rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
