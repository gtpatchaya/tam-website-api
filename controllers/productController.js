const db = require('../config/database');
const Product = require('../models/product');

exports.create = async (req, res) => {
    const { name, detail, category_id } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'INSERT INTO products (name, detail, category_type) VALUES (?, ?, ?)',
            [name, detail, category_id]
        );
        const productId = result.insertId;

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await connection.execute(
                    'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)',
                    [productId, file.filename]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ id: productId, name, detail });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.getAll = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, GROUP_CONCAT(pi.image_path) AS images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            GROUP BY p.id
        `);

        const formatted = products.map(product => ({
            ...product,
            images: product.images ? product.images.split(',').map(image => `uploads/${image}`) : []
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    const allProductInType = await Product.getByTypeId(id);
    res.status(200).json(allProductInType);
};


exports.update = async (req, res) => {
    const { id, name, detail, images, category_id, removeImages } = req.body;
    const connection = await db.getConnection();
    const removeImagesArray = removeImages ? removeImages.split(',').map(image => image.trim()) : [];
    try {   
        await connection.beginTransaction();

        // ตรวจสอบและจัดการค่าที่เป็น undefined
        const safeName = name || null;
        const safeDetail = detail || null;
        const safeCategoryId = category_id || null;
        const safeId = id || null;

        const [result] = await connection.execute(
            `UPDATE products 
            SET name = ?, detail = ?, category_type = ? 
            WHERE id = ?`,
            [safeName, safeDetail, safeCategoryId, safeId]
        );

        if (removeImagesArray && removeImagesArray.length > 0) {
            const placeholders = removeImagesArray.map(() => '?').join(',');
            await connection.execute(
                `DELETE FROM product_images WHERE product_id = ? AND image_path IN (${placeholders})`,
                [id, ...removeImagesArray]
            );
        }

        if (req.files && req.files.length > 0) {
            // เพิ่มรูปภาพใหม่
            for (const file of req.files) {
                await connection.execute(
                    'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)',
                    [id, file.filename]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ message: 'Product updated successfully', affectedRows: result.affectedRows });
    } catch (error) {
        await connection.rollback();
        console.error('Error during updating product:', error);
        res.status(500).json({
            message: 'Error updating product',
            error: error.message,
            stack: error.stack
        });
    } finally {
        connection.release();
    }
};

exports.delete = async (id) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
        const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);

        await connection.commit();
        return result.affectedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
