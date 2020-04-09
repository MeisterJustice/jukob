import mysql from 'mysql';
import dbconfig from '../config/database';
import util from 'util';
import User from '../models';
var connection = mysql.createConnection(dbconfig.connection);


export const getIndex = async (req, res, next) => {
  res.render('index', { title: 'Express' });
}

export const searchUser = async (req, res, next) => {
  let user = `SELECT * FROM users WHERE username LIKE '%${req.body.user}%'`;
  connection.query(user, (err, users) => {
    if(err) throw err;
    console.log(users);
  });
}

export const getCustom = async (req, res, next) => {
  if (req.body.search == 'item') {
    let findItems = `SELECT *
    FROM
    users AS u
    INNER JOIN university AS un
    ON u.university_id = un.university_id
    INNER JOIN sell_items AS s
    ON s.users_id = u.users_id
    INNER JOIN (
    SELECT *
    FROM item_images
    WHERE item_images_id IN (
    SELECT MAX(item_images_id)
    FROM item_images
    GROUP BY sell_items_id
    )
    ) AS m ON s.sell_items_id = m.sell_items_id
    WHERE un.name = '${req.body.school}' AND s.title LIKE '%${req.body.itemName}%'`;
    connection.query(findItems, (err, items) => {
      if (err) throw err;
      res.render('sell/index', { items });
    })
  }
  if (req.body.search == 'lodge') {
    if (req.body.priceRange == '0') {
      let findItems = `SELECT *
    FROM
    users AS u
    INNER JOIN university AS un
    ON u.university_id = un.university_id
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
    ) AS m ON s.lodges_id = m.lodges_id
    WHERE un.name = '${req.body.school}' AND s.location LIKE '%${req.body.location}%'`;
      connection.query(findItems, (err, items) => {
        if (err) throw err;
        res.render('lodge/index', { items });
      });
    }
    if (req.body.priceRange == '1') {
      let findItems = `SELECT *
    FROM
    users AS u
    INNER JOIN university AS un
    ON u.university_id = un.university_id
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
    ) AS m ON s.lodges_id = m.lodges_id
    WHERE un.name = '${req.body.school}' AND s.location LIKE '%${req.body.location}%' AND s.price BETWEEN 1 AND 49000`;
      connection.query(findItems, (err, items) => {
        if (err) throw err;
        res.render('lodge/index', { items });
      })
    }
    if (req.body.priceRange == '2') {
      let findItems = `SELECT *
    FROM
    users AS u
    INNER JOIN university AS un
    ON u.university_id = un.university_id
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
    ) AS m ON s.lodges_id = m.lodges_id
    WHERE un.name = '${req.body.school}' AND s.location LIKE '%${req.body.location}%' AND s.price BETWEEN 50000 AND 89000`;
      connection.query(findItems, (err, items) => {
        if (err) throw err;
        res.render('lodge/index', { items });
      })
    }
    if (req.body.priceRange == '3') {
      let findItems = `SELECT *
    FROM
    users AS u
    INNER JOIN university AS un
    ON u.university_id = un.university_id
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
    ) AS m ON s.lodges_id = m.lodges_id
    WHERE un.name = '${req.body.school}' AND s.location LIKE '%${req.body.location}%' AND s.price > 89000`;
      connection.query(findItems, (err, items) => {
        if (err) throw err;
        res.render('lodge/index', { items });
      })
    }
  }
}


export const getsignup = async (req, res, next) => {
  res.render('auth/signup', { message: req.flash('signupMessage') });
}

export const postsignup = async (req, res, next) => {
  try {
    if (req.file) {
      const { secure_url, public_id } = req.file;
      req.body.image = {
        secure_url,
        public_id
      }
    }
    let newUser = await new User({
      email: req.body.email,
      username: req.body.username
    });
    const user = await User.register(newUser, req.body.password);
    const data = await { username: user.username, email: user.email, password: user.salt, secure_image_url: user.image.secure_url };
    const insertUser = `INSERT INTO users SET ?`;
    connection.query(insertUser, data, (err, result) => {
      if (err) {
        console.log(err);
        req.flash('error', `could not authenticate you`);
        res.redirect('/signup');
      };
      req.login(user, function (err) {
        if (err) {
          req.flash('error', `${err}`);
          return res.redirect('/login');
        }
        req.flash('success', `We're pleased to have you, ${user.username}!`);
        res.redirect('/');
      });
    })
  } catch (err) {
    deleteProfileImage(req);
    const { username, email } = req.body;
    let error = err.message;
    if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
      error = 'A user with the given email is already registered';
    }
    res.render('auth/signup', { title: 'Register', username, email, error });
  }
}

export const getLogin = async (req, res, next) => {
  res.render('auth/login', { message: req.flash('loginMessage') });
}

export const postLogin = async (req, res, next) => {
  const {
    username,
    password
  } = req.body;
  const {
    user,
    error
  } = await User.authenticate()(username, password);
  if (!user && error) {
    req.flash('error', "Wrong username or password!");
    return res.redirect('/login');
  }
  req.login(user, function (err) {
    if (err) return res.redirect('/login');
    req.flash('success', `Welcome back ${username}`);
    const redirectUrl = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
  });
}

export const getLogout = async (req, res, next) => {
  req.logout();
  res.redirect('/');
}

export const getProfile = async (req, res, next) => {
  connection.query(`SELECT * FROM users WHERE username = '${req.user.username}'`, (err, result) => {
    if (err) throw err;
    res.render('profile/profile', { user: result[0] });
  })
}

export const getProfileSettings = async (req, res, next) => {
  let findUserInfo = `SELECT * FROM users WHERE username = '${req.user.username}'`;
  connection.query(findUserInfo, (err, result) => {
    if (err) throw err;
    let findDepartments = `SELECT * FROM department`;
    connection.query(findDepartments, (err, department) => {
      if (err) throw err;
      let findSkills = `SELECT * FROM skills`;
      connection.query(findSkills, (err, skill) => {
        if (err) throw err;
        let findUniversities = `SELECT * FROM university`;
        connection.query(findUniversities, (err, university) => {
          if (err) throw err;
          let findFaculty = `SELECT * FROM faculty`;
          connection.query(findFaculty, (err, faculty) => {
            if (err) throw err;
            console.log(result[0]);
            res.render('profile/settings', { user: result[0], department, skill, university, faculty });
          })
        })

      })
    })

  })

}

export const getProfileShow = async (req, res, next) => {
  let userSell = `SELECT *
  FROM
  users AS u
  INNER JOIN sell_items AS s
  ON u.users_id = s.users_id
  INNER JOIN (
  SELECT *
  FROM item_images
  WHERE item_images_id IN (
  SELECT MAX(item_images_id)
  FROM item_images
  GROUP BY sell_items_id
  )
  ) AS m 
  ON s.sell_items_id = m.sell_items_id
  WHERE u.username = '${req.params.id}'`;
  connection.query(userSell, (err, user) => {
    if (err) throw err;
    console.log(user)
    let userRent = `SELECT *
      FROM
      users AS u
      INNER JOIN rent_items AS s
      ON u.users_id = s.users_id
      INNER JOIN (
      SELECT *
      FROM item_images
      WHERE item_images_id IN (
      SELECT MAX(item_images_id)
      FROM item_images
      GROUP BY rent_items_id
      )
      ) AS m 
      ON s.rent_items_id = m.rent_items_id
      WHERE u.username = '${req.params.id}'`;
    connection.query(userRent, (err, user2) => {
      if (err) throw err;
      let userLodge = `SELECT *
        FROM
        users AS u
        INNER JOIN lodges AS s
        ON u.users_id = s.users_id
        INNER JOIN (
        SELECT *
        FROM item_images
        WHERE item_images_id IN (
        SELECT MAX(item_images_id)
        FROM item_images
        GROUP BY lodges_id
        )
        ) AS m 
        ON s.lodges_id = m.lodges_id
        WHERE u.username = '${req.params.id}'`;
      connection.query(userLodge, (err, user3) => {
        if (err) throw err;
        res.render('profile/show', { sell: user, rent: user2, lodge: user3 });
      })
    })

  })
}

export const putProfile = async (req, res, next) => {
  const {
    username,
    email,
    first_name,
    last_name,
    phone_number,
    university,
    faculty,
    department,
    skill
  } = req.body;
  let uni = await parseInt(university);
  let fac = await parseInt(faculty);
  let dep = await parseInt(department);
  let ski = await parseInt(skill);
  let phone = await parseInt(phone_number);
  const user = await User.findById(req.user._id);
  if (username) user.username = username;
  if (email) user.email = email;
  if (req.file) {
    // if (user.image.public_id) await cloudinary.v2.uploader.destroy(user.image.public_id);
    const { secure_url, public_id } = req.file;
    user.image = { secure_url, public_id };
    let data = { username: username, email: email, first_name: first_name, last_name: last_name, phone_number: phone, secure_image_url: secure_url, public_image_id: public_id, department_id: dep, skills_id: ski, university_id: uni, faculty_id: fac };
    let updateUser = `UPDATE users SET ? WHERE username = '${req.user.username}'`;
    connection.query(updateUser, data, (err, result2) => {
      if (err) throw err;
    });
  }
  let data = { username: username, email: email, first_name: first_name, last_name: last_name, phone_number: phone, department_id: dep, skills_id: ski, university_id: uni, faculty_id: fac };
  let updateUser = `UPDATE users SET ? WHERE username = '${req.user.username}'`;
  await user.save();
  await connection.query(updateUser, data, (err, result2) => {
    if (err) throw err;
  });
  const login = await util.promisify(req.login.bind(req));
  await login(user);
  req.flash('success', 'Profile successfully updated!');
  res.redirect(`back`);
}

export const deleteUser = async (req, res, next) => {
  await User.findOneAndRemove({ username: req.user.username });
  let deleteUser = `DELETE FROM users WHERE username = '${req.user.username}'`;
  connection.query(deleteUser, (err, done) => {
    if (err) throw err;
    req.flash("success", "We're sad to see you go");
    req.logout();
    return res.redirect("/");
  })
}