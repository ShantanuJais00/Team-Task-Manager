import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Plus, Clock, Circle, CheckCircle2, ShieldAlert } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do', priority: 'Medium' });

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`),
        axios.get(`http://localhost:5000/api/tasks?project=${id}`)
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error loading project');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', { ...newTask, project: id });
      toast.success('Task created!');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium' });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating task');
    }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Not authorized');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You do not have permission to view this project.</p>
        <Link to="/projects"><Button>Back to Projects</Button></Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';
  const isOwner = project.owner?._id === user?._id;
  const canManage = isAdmin || isOwner;

  const getPriorityBadgeClass = (priority: string) => {
    if (priority === 'High') return 'bg-destructive/10 text-destructive border-destructive/20';
    if (priority === 'Medium') return 'bg-warning/10 text-warning-foreground border-warning/20';
    return 'bg-muted text-muted-foreground border-muted';
  };

  const columns = [
    { id: 'To Do', icon: Circle, iconClass: 'text-muted-foreground' },
    { id: 'In Progress', icon: Clock, iconClass: 'text-warning' },
    { id: 'Done', icon: CheckCircle2, iconClass: 'text-success' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Projects
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
            {isOwner && !isAdmin && (
              <Badge variant="outline" className="border-primary/30 text-primary">Owner</Badge>
            )}
            {isAdmin && (
              <Badge variant="outline" className="border-warning/50 text-warning-foreground bg-warning/10">Admin</Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
          )}
        </div>
        {canManage && (
          <Button onClick={() => setShowTaskModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <col.icon className={`h-4 w-4 ${col.iconClass}`} />
                  <h3 className="font-semibold text-sm text-foreground">{col.id}</h3>
                </div>
                <Badge variant="outline" className="text-xs font-bold">{colTasks.length}</Badge>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {colTasks.map(task => {
                  const isAssignee = task.assignee?._id === user?._id;
                  const canEdit = canManage || isAssignee;
                  return (
                    <Card key={task._id} className="border-border hover:border-primary/40 hover:shadow-sm transition-all group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm text-foreground leading-snug">{task.title}</p>
                          <Badge variant="outline" className={`shrink-0 text-[10px] font-bold uppercase ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                              {task.assignee?.name ? task.assignee.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="text-xs text-muted-foreground truncate max-w-[90px]">
                              {task.assignee?.name || 'Unassigned'}
                            </span>
                          </div>
                          {canEdit && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {col.id !== 'To Do' && (
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveTask(task._id, col.id === 'Done' ? 'In Progress' : 'To Do')}
                                >←</Button>
                              )}
                              {col.id !== 'Done' && (
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveTask(task._id, col.id === 'To Do' ? 'In Progress' : 'Done')}
                                >→</Button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-border shadow-2xl">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <form onSubmit={createTask}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Design login page"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-desc">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <textarea
                    id="task-desc"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                    placeholder="Task details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-status">Status</Label>
                    <select
                      id="task-status"
                      value={newTask.status}
                      onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <select
                      id="task-priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 px-6 pb-6 border-t border-border pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
