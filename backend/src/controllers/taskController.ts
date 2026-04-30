import { Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { AuthRequest } from '../middleware/authMiddleware';

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, dueDate, project, assignee } = req.body;

  try {
    const parentProject = await Project.findById(project);
    if (!parentProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (
      req.user?.role !== 'Admin' &&
      parentProject.owner.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Only Admin or Project Owner can create tasks' });
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignee,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  const projectId = req.query.project;
  
  try {
    let query: any = {};
    if (projectId) {
      query.project = projectId;
    }
    
    // Additional access control could be implemented here to only return tasks for projects the user has access to.
    // For simplicity, we assume if they can reach this endpoint they get the tasks (but we could filter).
    
    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('project', 'title');
      
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('project', 'title owner members');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project: any = task.project;

    // Check permissions
    // Assignee can update status. Project owner/Admin can update anything.
    const isAssignee = task.assignee?.toString() === req.user?._id.toString();
    const isOwner = project.owner.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'Admin';

    if (!isAdmin && !isOwner && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    if (isAssignee && !isOwner && !isAdmin) {
      // Assignee can only update status
      task.status = req.body.status || task.status;
    } else {
      // Owner or Admin can update anything
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.assignee = req.body.assignee || task.assignee;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project: any = task.project;

    if (req.user?.role !== 'Admin' && project.owner.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
