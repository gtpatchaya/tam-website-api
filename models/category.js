const db = require('../config/database');

class Category {
    static async create(name, detail) {
        const [result] = await db.execute(
            'INSERT INTO categories (name, detail) VALUES (?, ?)',
            [name, detail]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM categories');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, name, detail) {
        const [result] = await db.execute(
            'UPDATE categories SET name = ?, detail = ? WHERE id = ?',
            [name, detail, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Category;