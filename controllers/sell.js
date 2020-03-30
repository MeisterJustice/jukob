import mysql from 'mysql';
import dbconfig from '../config/database';
var connection = mysql.createConnection(dbconfig.connection);


export const getSell = async (req, res, next) => {
    let findItems = `SELECT *
    FROM
    users AS u
    INNER JOIN sell_items AS s
    ON s.users_id = u.users_id
    INNER JOIN item_images AS m
    ON m.sell_items_id = s.sell_items_id
    INNER JOIN
    (
        SELECT sell_items_id, MAX(upload_date) maxDate
        FROM item_images
        GROUP BY sell_items_id
    ) b ON m.sell_items_id = b.sell_items_id AND
            m.upload_date = b.maxDate`;

    connection.query(findItems, (err, items) => {
        if (err) throw err;
        console.log(items)
        res.render('sell/index', { items });
    });
}

export const getSellShowPage = async (req, res, next) => {
    let getSell = `SELECT *
    FROM
    users AS u
    INNER JOIN sell_items AS s
    ON s.users_id = u.users_id
    INNER JOIN item_images AS m
    ON m.sell_items_id = s.sell_items_id
    WHERE s.sell_items_id = ${req.params.id}`;
    connection.query(getSell, (err, item) => {
        if (err) throw err;
        res.render('sell/show', { item: item[0] });
    })
}

export const postSell = async (req, res, next) => {
    const findUser = `SELECT users_id FROM users WHERE username = '${req.user.username}'`
    connection.query(findUser, (err, user) => {
        if (err) throw err;
        console.log(user[0]);
        const data = { title: req.body.title, description: req.body.description, location: req.body.location, price: parseInt(req.body.price), users_id: user[0].users_id }
        const insertItem = `INSERT INTO sell_items SET ?`;
        connection.query(insertItem, data, (err, result) => {
            if (err) throw err;
            for (const file of req.files) {
                const info = {
                    image_url: file.secure_url,
                    image_id: file.public_id,
                    sell_items_id: result.insertId
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
    res.render('sell/new');
}

export const deleteItem = async (req, res, next) => {
    let deleteImages = `DELETE FROM item_images WHERE sell_items_id = ${req.params.id}`;
    connection.query(deleteImages, (err, done) => {
        if (err) throw err;
        let deleteItems = `DELETE FROM sell_items WHERE sell_items_id = ${req.params.id}`;
        connection.query(deleteItems, (err, deleted) => {
            if (err) throw err;
            req.flash("success", "Item successfully deleted");
            return res.redirect("/");
        })
    })
}