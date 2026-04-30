import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching details');
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
      toast.success('Task created!');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium' });
      fetchProjectAndTasks(); // Refresh tasks
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating task');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating task');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-text-muted font-medium animate-pulse">Loading board...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-muted mb-6">You do not have permission to view this project or it does not exist.</p>
        <Link to="/projects" className="px-6 py-2 bg-primary text-white font-bold rounded-xl">Back to Projects</Link>
      </div>
    );
  }

  // RBAC checks
  const isAdmin = user?.role === 'Admin';
  const isOwner = project.owner?._id === user?._id;
  const canManageTasks = isAdmin || isOwner;

  const columns = [
    { id: 'To Do', title: 'To Do', icon: AlertCircle, iconColor: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800/30', border: 'border-gray-200 dark:border-gray-800' },
    { id: 'In Progress', title: 'In Progress', icon: Clock, iconColor: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-900/30' },
    { id: 'Done', title: 'Done', icon: CheckCircle2, iconColor: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-900/30' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between bg-surface/50 p-6 rounded-2xl border border-border backdrop-blur-sm">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-2 text-text-muted hover:text-primary mb-3 transition-colors text-sm font-bold bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text">{project.title}</h1>
            {canManageTasks && !isAdmin && (
              <span className="text-[10px] uppercase font-bold px-2 py-1 bg-primary/10 text-primary rounded-md">Project Owner</span>
            )}
          </div>
          <p className="text-text-muted mt-2 max-w-2xl">{project.description}</p>
        </div>
        
        {/* RBAC: Only Admin or Owner can create tasks */}
        {canManageTasks && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden pb-4">
        {columns.map(col => (
          <div key={col.id} className={`flex flex-col rounded-2xl border ${col.border} ${col.bg} transition-colors`}>
            <div className={`p-4 border-b ${col.border} flex items-center justify-between bg-background/40 backdrop-blur-sm rounded-t-2xl`}>
              <div className="flex items-center gap-2.5">
                <col.icon className={`w-5 h-5 ${col.iconColor}`} />
                <h3 className="font-bold text-text">{col.title}</h3>
              </div>
              <span className="bg-background border border-border shadow-sm text-text text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tasks.filter(t => t.status === col.id).map(task => {
                const isAssignee = task.assignee?._id === user?._id;
                const canEditTask = canManageTasks || isAssignee;

                return (
                  <div key={task._id} className="bg-background p-5 rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-text">{task.title}</h4>
                      <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md border ${
                        task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50' :
                        'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-text-muted mb-4 line-clamp-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold text-text" title={task.assignee?.name || 'Unassigned'}>
                          {task.assignee?.name ? task.assignee.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-xs font-medium text-text-muted truncate max-w-[100px]">
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                      
                      {/* RBAC: Only authorized users can move tasks */}
                      {canEditTask && (
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.id !== 'To Do' && (
                            <button 
                              onClick={() => updateTaskStatus(task._id, col.id === 'Done' ? 'In Progress' : 'To Do')} 
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border text-text-muted hover:text-primary hover:border-primary/50 transition-colors"
                              title="Move Left"
                            >
                              &larr;
                            </button>
                          )}
                          {col.id !== 'Done' && (
                            <button 
                              onClick={() => updateTaskStatus(task._id, col.id === 'To Do' ? 'In Progress' : 'Done')} 
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border text-text-muted hover:text-primary hover:border-primary/50 transition-colors"
                              title="Move Right"
                            >
                              &rarr;
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="flex flex-col items-center justify-center text-sm text-text-muted py-10 border-2 border-dashed border-border rounded-xl bg-surface/50">
                  <col.icon className={`w-8 h-8 mb-2 opacity-20`} />
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl p-8 w-full max-w-md shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-text mb-6">Add New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text mb-1.5">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  placeholder="e.g. Design Login Page"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-1.5">Description <span className="text-text-muted font-normal">(Optional)</span></label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-24 resize-none"
                  placeholder="Task details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text mb-1.5">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text mb-1.5">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 font-bold text-text-muted hover:text-text hover:bg-surface rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
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
