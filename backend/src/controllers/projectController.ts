import { Response } from 'express';
import { Project } from '../models/Project';
import { AuthRequest } from '../middleware/authMiddleware';

export const createProject = async (req: AuthRequest, res: Response) => {
  const { title, description, members } = req.body;

  try {
    const project = new Project({
      title,
      description,
      owner: req.user?._id,
      members: members || [],
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    let projects;
    if (req.user?.role === 'Admin') {
      projects = await Project.find({}).populate('owner', 'name email').populate('members', 'name email');
    } else {
      projects = await Project.find({
        $or: [{ owner: req.user?._id }, { members: req.user?._id }],
      }).populate('owner', 'name email').populate('members', 'name email');
    }
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name email').populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Access control
    if (
      req.user?.role !== 'Admin' &&
      project.owner.toString() !== req.user?._id.toString() &&
      !project.members.some((member: any) => member._id.toString() === req.user?._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user?.role !== 'Admin' && project.owner.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    if (req.body.members) {
      project.members = req.body.members;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user?.role !== 'Admin' && project.owner.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
