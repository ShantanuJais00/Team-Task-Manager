import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { FolderOpen, Plus, Users, AlertCircle } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', members: [] as string[] });
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') fetchUsers();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.filter((u: any) => u._id !== user?._id));
    } catch { /* silent */ }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created!');
      setShowModal(false);
      setNewProject({ title: '', description: '', members: [] });
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating project');
    }
  };

  const toggleMember = (uid: string) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.includes(uid)
        ? prev.members.filter(id => id !== uid)
        : [...prev.members, uid]
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your team projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No projects found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {user?.role === 'Admin'
              ? 'Create your first project to get started.'
              : 'You have not been added to any projects yet.'}
          </p>
          {user?.role === 'Admin' && (
            <Button variant="outline" onClick={() => setShowModal(true)}>
              <Plus className="mr-1 h-4 w-4" /> Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Link to={`/projects/${project._id}`} key={project._id} className="block">
              <Card className="border-border hover:border-primary/50 hover:shadow-md transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold truncate">{project.title}</CardTitle>
                    {user?.role === 'Admin' && (
                      <Badge variant="outline" className="shrink-0 text-[10px] border-primary/30 text-primary">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description provided.'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{project.members?.length || 0} Members</span>
                    </div>
                    <span className="text-xs">
                      {project.owner?._id === user?._id ? 'You (Owner)' : project.owner?.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-border shadow-2xl">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <form onSubmit={handleCreateProject}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proj-title">Title</Label>
                  <Input
                    id="proj-title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Website Redesign"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-desc">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <textarea
                    id="proj-desc"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
                    placeholder="What is this project about?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign Members</Label>
                  <div className="max-h-36 overflow-y-auto border border-input rounded-md bg-background p-2 space-y-1">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2 text-center">No other members registered yet.</p>
                    ) : (
                      users.map(u => (
                        <label key={u._id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={newProject.members.includes(u._id)}
                            onChange={() => toggleMember(u._id)}
                            className="w-4 h-4 rounded border-input accent-primary"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {u.name} <span className="text-muted-foreground font-normal">({u.role})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 px-6 pb-6 border-t border-border pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Projects;
