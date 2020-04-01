import mysql from 'mysql';
import dbconfig from '../config/database';
var connection = mysql.createConnection(dbconfig.connection);


export const getLodge = async (req, res, next) => {
    let findLodges = `SELECT *
    FROM
    users AS u
    INNER JOIN lodges AS s
    ON s.users_id = u.users_id
    INNER JOIN (
    SELECT *
    FROM item_images
    WHERE item_images_id IN (
    SELECT MAX(item_images_id)
    FROM item_images
    GROUP BY lodges_id
    )
    ) AS m ON s.lodges_id = m.lodges_id`;

    connection.query(findLodges, (err, items) => {
        if (err) throw err;
        console.log(items)
        res.render('lodge/index', { items });
    });
}

export const getLodgeShowPage = async (req, res, next) => {
    let getSell = `SELECT *
    FROM
    users AS u
    INNER JOIN lodges AS s
    ON s.users_id = u.users_id
    INNER JOIN item_images AS m
    ON m.lodges_id = s.lodges_id
    WHERE s.lodges_id = ${req.params.id}`;
    connection.query(getSell, (err, item) => {
        if (err) throw err;
        res.render('lodge/show', { item: item[0] });
    })
}

export const postLodge = async (req, res, next) => {
    const findUser = `SELECT users_id FROM users WHERE username = '${req.user.username}'`
    connection.query(findUser, (err, user) => {
        if (err) throw err;
        console.log(user[0]);
        const data = { name: req.body.name, description: req.body.description, location: req.body.location, price: parseInt(req.body.price), users_id: user[0].users_id }
        const insertItem = `INSERT INTO lodges SET ?`;
        connection.query(insertItem, data, (err, result) => {
            if (err) throw err;
            for (const file of req.files) {
                const info = {
                    image_url: file.secure_url,
                    image_id: file.public_id,
                    lodges_id: result.insertId
                }
                const insertImage = `INSERT INTO item_images SET ?`;
                connection.query(insertImage, info, (err, success) => {
                    if (err) throw err;
                })
            }
        });
        req.flash('success', 'Your item was posted successfully')
        res.redirect('/profile');
    })
}

export const getNewLodge = async (req, res, next) => {
    res.render('lodge/new');
}

export const getPutLodge = async (req, res, next) => {
    let findLodge = `SELECT * 
    FROM users AS u 
    INNER JOIN lodges AS l
    ON l.users_id = u.users_id
    WHERE l.lodges_id = ${req.params.id}`;
    connection.query(findLodge, (err, result) => {
        if (err) throw err;
        if(result[0].username !== req.user.username) {
            req.flash('error', `You don't have access to do that!`)
            res.redirect('back');
        }
        
        res.render('lodge/update', { item: result[0] });
    })

}

export const putLodge = async (req, res, next) => {
    let findLodge = `SELECT * 
    FROM users AS u 
    INNER JOIN lodges AS l
    ON l.users_id = u.users_id
    WHERE l.lodges_id = ${req.params.id}`;
    connection.query(findLodge, (err, result) => {
        if (err) throw err;
        if(result[0].username !== req.user.username) {
            req.flash('error', `You don't have access to do that!`)
            res.redirect('back');
        }
        
        let data = { name: req.body.name, location: req.body.location, price: req.body.price, description: req.body.description };
        console.log(req.body.name)
        let updateLodge = `UPDATE lodges SET ? WHERE lodges_id = ${req.params.id}`;
        connection.query(updateLodge, data, (err, result) => {
            if (err) throw err;
            req.flash('success', 'lodge item was updated successfully')
            res.redirect('/profile')
        })
    })
}

export const deleteItem = async (req, res, next) => {
    let deleteImages = `DELETE FROM item_images WHERE lodges_id = ${req.params.id}`;
    connection.query(deleteImages, (err, done) => {
        if (err) throw err;
        let deleteItems = `DELETE FROM lodges WHERE lodges_id = ${req.params.id}`;
        connection.query(deleteItems, (err, deleted) => {
            if (err) throw err;
            req.flash("success", "lodge successfully deleted");
            return res.redirect("/");
        })
    })
}

