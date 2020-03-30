import mysql from 'mysql';
import dbconfig from '../config/database';
var connection = mysql.createConnection(dbconfig.connection);


export const getRent = async (req, res, next) => {
    let findItems = `SELECT *
    FROM
    users AS u
    INNER JOIN rent_items AS s
    ON s.users_id = u.users_id
    INNER JOIN (
    SELECT *
    FROM item_images
    WHERE item_images_id IN (
    SELECT MAX(item_images_id)
    FROM item_images
    GROUP BY rent_items_id
    )
    ) AS m ON s.rent_items_id = m.rent_items_id`;

    connection.query(findItems, (err, items) => {
        if (err) throw err;
        console.log(items)
        res.render('rent/index', { items });
    });
}

export const getRentShowPage = async (req, res, next) => {
    let getRent = `SELECT *
    FROM
    users AS u
    INNER JOIN rent_items AS s
    ON s.users_id = u.users_id
    INNER JOIN item_images AS m
    ON m.rent_items_id = s.rent_items_id
    WHERE s.rent_items_id = ${req.params.id}`;
    connection.query(getRent, (err, item) => {
        if (err) throw err;
        res.render('rent/show', { item: item[0] });
    })
}

export const postRent = async (req, res, next) => {
    const findUser = `SELECT users_id FROM users WHERE username = '${req.user.username}'`
    connection.query(findUser, (err, user) => {
        if (err) throw err;
        console.log(user[0]);
        const data = { title: req.body.title, description: req.body.description, location: req.body.location, price: parseInt(req.body.price), users_id: user[0].users_id }
        const insertItem = `INSERT INTO rent_items SET ?`;
        connection.query(insertItem, data, (err, result) => {
            if (err) throw err;
            for (const file of req.files) {
                const info = {
                    image_url: file.secure_url,
                    image_id: file.public_id,
                    rent_items_id: result.insertId
                }
                const insertImage = `INSERT INTO item_images SET ?`;
                connection.query(insertImage, info, (err, success) => {
                    if (err) throw err;
                })
            }
        });
        req.flash('success', 'Your item was posted successfully. Check back often for orders')
        res.redirect('/profile');
    })
}

export const getNew = async (req, res, next) => {
    res.render('rent/new');
}

export const deleteItem = async (req, res, next) => {
    let deleteImages = `DELETE FROM item_images WHERE rent_items_id = ${req.params.id}`;
    connection.query(deleteImages, (err, done) => {
        if (err) throw err;
        let deleteItems = `DELETE FROM rent_items WHERE rent_items_id = ${req.params.id}`;
        connection.query(deleteItems, (err, deleted) => {
            if (err) throw err;
            req.flash("success", "Item successfully deleted");
            return res.redirect("/");
        })
    })
}