import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { Run, Analysis } from './models/Run';
import Reel from './models/Reel';
import { Script } from './models/Script';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- RUN ROUTES ---

app.post('/api/runs', async (req, res) => {
  try {
    const run = new Run(req.body);
    await run.save();
    res.status(201).json(run);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update a run (e.g. naming or status)
app.patch('/api/runs/:id', async (req, res) => {
  try {
    const run = await Run.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(run);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/runs', async (req, res) => {
  try {
    const runs = await Run.find().sort({ timestamp: -1 });
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- ANALYSIS ROUTES ---

app.post('/api/runs/:id/analysis', async (req, res) => {
  try {
    const runId = req.params.id;
    // Upsert analysis
    const analysis = await Analysis.findOneAndUpdate(
      { runId },
      { ...req.body, runId },
      { upsert: true, new: true }
    );
    res.status(201).json(analysis);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/runs/:id/analysis', async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ runId: req.params.id });
    res.json(analysis);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/analysis', async (req, res) => {
    try {
      const allAnalysis = await Analysis.find().populate('runId');
      res.json(allAnalysis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

// --- SCRIPT ROUTES ---

app.post('/api/analysis/:id/scripts', async (req, res) => {
  try {
    const analysisId = req.params.id;
    const { scripts, runId } = req.body;
    
    if (!Array.isArray(scripts)) {
      return res.status(400).json({ message: 'scripts must be an array' });
    }

    const scriptsToInsert = scripts.map((s: any) => ({
      ...s,
      analysisId,
      runId
    }));

    // Delete existing scripts for this analysis if any (optional, or just append)
    // await Script.deleteMany({ analysisId });
    
    const result = await Script.insertMany(scriptsToInsert);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/analysis/:id/scripts', async (req, res) => {
  try {
    const scripts = await Script.find({ analysisId: req.params.id }).sort({ timestamp: -1 });
    res.json(scripts);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/scripts', async (req, res) => {
    try {
      const allScripts = await Script.find().populate('analysisId').populate('runId').sort({ timestamp: -1 });
      res.json(allScripts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

// --- REEL ROUTES ---

// Bulk add reels to a run
app.post('/api/runs/:runId/reels', async (req, res) => {
  try {
    const { reels } = req.body;
    if (!Array.isArray(reels)) {
      return res.status(400).json({ message: 'reels must be an array' });
    }

    const runId = req.params.runId;
    const reelsToInsert = reels.map((reel: any) => ({
      ...reel,
      runId,
      instagramId: reel.id // Mapping Apify 'id' to our schema
    }));

    const result = await Reel.insertMany(reelsToInsert);
    
    // Update the run's total items
    await Run.findByIdAndUpdate(runId, { 
      totalItems: reels.length,
      status: 'completed'
    });

    res.status(201).json({ count: result.length });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get reels for a specific run
app.get('/api/runs/:runId/reels', async (req, res) => {
  try {
    const reels = await Reel.find({ runId: req.params.runId });
    res.json(reels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
