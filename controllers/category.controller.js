const Category = require("../models/category.model");

exports.getAll = async (req, res) => {
    try {
        const data = await Category.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Category.getById(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.create = async (req, res) => {
    try {
        await Category.create(req.body.name);
        res.json({ message: "Thêm thành công" });
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.update = async (req, res) => {
    try {
        await Category.update(req.params.id, req.body.name);
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.delete = async (req, res) => {
    try {
        await Category.delete(req.params.id);
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json(err);
    }
};