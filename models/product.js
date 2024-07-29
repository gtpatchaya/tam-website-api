const db = require('../config/database');

class Product {
    static async create(name, detail, images, type) {
        const [result] = await db.execute(
            'INSERT INTO products (name, detail, images, type) VALUES (?, ?, ?, ?)',
            [name, detail, JSON.stringify(images), type]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM products');
        return rows.map(row => ({ ...row, images: JSON.parse(row.images) }));
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
        if (rows[0]) {
            rows[0].images = JSON.parse(rows[0].images);
        }
        return rows[0];
    }

    static async getByTypeId(id) {
        // Query products with images
        const [rows] = await db.execute(
            `SELECT p.id, p.name, p.detail, pi.image_path
         FROM products p
         LEFT JOIN product_images pi ON p.id = pi.product_id
         WHERE p.category_type = ?`,
            [id]
        );

        // Create a map to hold products with their images
        const productsMap = new Map();

        // Process each row to group images by product
        rows.forEach(row => {
            if (!productsMap.has(row.id)) {
                productsMap.set(row.id, {
                    name: row.name,
                    detail: row.detail,
                    images: []
                });
            }

            if (row.image_path) {
                productsMap.get(row.id).images.push(`uploads/${row.image_path}`);
            }
        });

        // Convert the map to an array
        const products = Array.from(productsMap.values());

        return products;
    }


    static async update(id, name, detail, images) {
        const [result] = await db.execute(
            'UPDATE products SET name = ?, detail = ?, images = ? WHERE id = ?',
            [name, detail, JSON.stringify(images), id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Product;