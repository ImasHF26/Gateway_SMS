const Database = require('../../config/database');
const db = new Database();

const getAllTemplates = async (req, res) => {
  try {
    const templates = await db.getAllTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await db.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Modèle non trouvé' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Le titre et le contenu du modèle sont obligatoires'
      });
    }

    const newTemplate = await db.addTemplate({
      title: title.trim(),
      content: content.trim(),
      category: category ? category.trim() : 'Personnalisé'
    });

    res.status(201).json({ success: true, data: newTemplate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Le titre et le contenu du modèle sont obligatoires'
      });
    }

    const updated = await db.updateTemplate(req.params.id, {
      title: title.trim(),
      content: content.trim(),
      category: category ? category.trim() : 'Personnalisé'
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const result = await db.deleteTemplate(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
