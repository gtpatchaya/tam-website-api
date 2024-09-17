const Category = require('../models/category');
const db = require('../config/database');

exports.createCategory = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { name, detail, orderDisplay } = req.body;

        // เริ่มต้น transaction
        await connection.beginTransaction();

        // Insert category
        const [categoryResult] = await connection.execute(
            'INSERT INTO categories (name, detail, orderDisplay) VALUES (?, ?, ?)',
            [name, detail, orderDisplay]
        );
        const categoryId = categoryResult.insertId;

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await connection.execute(
                    'INSERT INTO category_images (category_id, image_path) VALUES (?, ?)',
                    [categoryId, file.filename]
                );
            }
        }

        // Commit transaction
        await connection.commit();
        res.status(201).json({ id: categoryId, name, detail });
    } catch (error) {
        // Rollback transaction
        await connection.rollback();

        console.error('Error during creating category:', error);

        // ส่งข้อความ error พร้อมรายละเอียดเพิ่มเติม
        res.status(500).json({
            message: 'Error creating category',
            error: error.message,
            stack: error.stack
        });
    } finally {
        connection.release();
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT c.*, GROUP_CONCAT(ci.image_path) AS images
            FROM categories c
            LEFT JOIN category_images ci ON c.id = ci.category_id
            GROUP BY c.id
            ORDER BY c.orderDisplay ASC
        `);

        const formattedCategories = categories.map(category => ({
            ...category,
            images: category.images ? category.images.split(',').map(image => `uploads/${image}`) : []
        }));

        res.json(formattedCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};

exports.getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.getById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const { name, detail, removeImages, orderDisplay } = req.body;
        const removeImagesArray = removeImages ? removeImages.split(',').map(image => image.trim()) : []
        // เริ่มต้น transaction
        await connection.beginTransaction();

        // ตรวจสอบว่ามี category ที่ต้องการแก้ไขหรือไม่
        const [categories] = await connection.execute(
            'SELECT * FROM categories WHERE id = ?',
            [id]
        );
        const category = categories[0];

        if (!category) {
            await connection.rollback();
            return res.status(404).json({ error: 'Category not found' });
        }

        // อัปเดต category
        await connection.execute(
            'UPDATE categories SET name = ?, detail = ?, orderDisplay = ? WHERE id = ?',
            [name, detail, orderDisplay, id]
        );

        if (removeImagesArray && removeImagesArray.length > 0) {
            const placeholders = removeImagesArray.map(() => '?').join(',');
            await connection.execute(
                `DELETE FROM category_images WHERE category_id = ? AND image_path IN (${placeholders})`,
                [id, ...removeImagesArray]
            );
        }

        if (req.files && req.files.length > 0) {
            // เพิ่มรูปภาพใหม่
            for (const file of req.files) {
                await connection.execute(
                    'INSERT INTO category_images (category_id, image_path) VALUES (?, ?)',
                    [id, file.filename]
                );
            }
        }

        // Commit transaction
        await connection.commit();

        res.json({ id, name, detail });
    } catch (error) {
        // Rollback transaction
        await connection.rollback();

        console.error('Error during updating category:', error);

        // ส่งข้อความ error พร้อมรายละเอียดเพิ่มเติม
        res.status(500).json({
            message: 'Error updating category',
            error: error.message,
            stack: error.stack
        });
    } finally {
        connection.release();
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const affectedRows = await Category.delete(req.params.id);
        if (affectedRows) {
            const category = await Category.getById(req.params.id);
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};