import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FolderGit2, Plus, Users, ShieldAlert } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', newProject);
      toast.success('Project created successfully!');
      setShowModal(false);
      setNewProject({ title: '', description: '' });
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating project');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-text-muted font-medium animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 bg-surface/50 p-6 rounded-2xl border border-border backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Projects</h1>
          <p className="text-text-muted">Manage and track all your team projects.</p>
        </div>
        
        {/* Role-Based Access Control: Only Admins can create projects */}
        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <Link
            to={`/projects/${project._id}`}
            key={project._id}
            className="block bg-background rounded-2xl p-6 shadow-sm border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface border border-border text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                <FolderGit2 className="w-6 h-6" />
              </div>
              {user?.role === 'Admin' && project.owner?._id !== user._id && (
                 <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-surface text-text-muted rounded-md flex items-center gap-1 border border-border">
                    <ShieldAlert className="w-3 h-3" /> Admin View
                 </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
            <p className="text-text-muted text-sm mb-6 line-clamp-2 h-10">
              {project.description || 'No description provided for this project.'}
            </p>
            <div className="flex items-center justify-between text-sm text-text-muted border-t border-border pt-4">
              <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-border">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium text-text">{project.members?.length || 0}</span>
              </div>
              <div className="text-xs font-medium px-2 py-1 bg-surface rounded-lg border border-border text-text">
                Owner: {project.owner?._id === user?._id ? 'You' : project.owner?.name}
              </div>
            </div>
          </Link>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-surface/30">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
              <FolderGit2 className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">No projects found</h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              {user?.role === 'Admin' 
                ? "You haven't created any projects yet. Get started by creating your first project."
                : "You haven't been added to any projects yet. Please contact an Admin."}
            </p>
            {user?.role === 'Admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="text-primary font-bold hover:text-primary-dark transition-colors px-6 py-2 bg-primary/10 rounded-xl"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl p-8 w-full max-w-md shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-text mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text mb-1.5">Project Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-1.5">Description <span className="text-text-muted font-normal">(Optional)</span></label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-28 resize-none"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 font-bold text-text-muted hover:text-text hover:bg-surface rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
