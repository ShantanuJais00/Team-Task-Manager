import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get('http://localhost:5000/api/projects'),
          axios.get('http://localhost:5000/api/tasks')
        ]);

        const projects = projectsRes.data;
        const tasks = tasksRes.data;

        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          todoTasks: tasks.filter((t: any) => t.status === 'To Do').length,
          inProgressTasks: tasks.filter((t: any) => t.status === 'In Progress').length,
          doneTasks: tasks.filter((t: any) => t.status === 'Done').length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-text-muted">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-background rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-text">{stats.totalProjects}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">To Do Tasks</p>
            <p className="text-3xl font-bold text-text">{stats.todoTasks}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900/20 text-gray-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">In Progress</p>
            <p className="text-3xl font-bold text-text">{stats.inProgressTasks}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">Completed</p>
            <p className="text-3xl font-bold text-text">{stats.doneTasks}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      {/* Placeholder for recent tasks or projects list */}
      <div className="bg-background rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-96 flex items-center justify-center text-text-muted">
        Select 'Projects' from the sidebar to manage your work.
      </div>
    </div>
  );
};

export default Dashboard;
