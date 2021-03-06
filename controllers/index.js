import mysql from 'mysql';
import dbconfig from '../config/database';
import util from 'util';
import User from '../models';
import moment from 'moment';
var connection = mysql.createConnection(dbconfig.connection);


export const getIndex = async (req, res, next) => {
  res.render('index', { title: 'Express' });
}

export const searchUser = async (req, res, next) => {
  let user = `SELECT * FROM users WHERE username LIKE '%${req.body.user}%'`;
  connection.query(user, (err, users) => {
    if (err) throw err;
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
  let uni = `SELECT * FROM university`;
  connection.query(uni, (err, university) => {
    if (err) throw err;
    res.render('auth/signup', { university });
  })
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
    const data = await { username: user.username, email: user.email, password: user.salt, secure_image_url: user.image.secure_url, university_id: parseInt(req.body.university) };
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
    // deleteProfileImage(req);
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
  let findItems = `SELECT *
    FROM
    users AS u
    LEFT JOIN university AS un
    ON u.university_id = un.university_id
    LEFT JOIN faculty AS f
    ON u.faculty_id = f.faculty_id
    LEFT JOIN department AS d
    ON u.department_id = d.department_id
    LEFT JOIN skills AS sk
    ON u.skills_id = sk.skills_id
    LEFT JOIN sell_items AS s
    ON s.users_id = u.users_id
    LEFT JOIN (
    SELECT *
    FROM item_images
    WHERE item_images_id IN (
    SELECT MAX(item_images_id)
    FROM item_images
    GROUP BY sell_items_id
    )
    ) AS m ON s.sell_items_id = m.sell_items_id WHERE u.username = '${req.user.username}'`;
  connection.query(findItems, (err, result) => {
    if (err) throw err;
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
    ) AS m ON s.lodges_id = m.lodges_id WHERE u.username = '${req.user.username}'`;
    connection.query(findLodges, (err, result1) => {
      if(err) throw err;
      let registerDate = moment(result[0].register_date).format("MMMM, YYYY");
      res.render('profile/profile', { user: result, date: registerDate, lodge: result1 });
    }) 
  })
}

export const getProfileSettings = async (req, res, next) => {
  let findUserInfo = `SELECT * 
  FROM users AS u
  LEFT JOIN university AS un
  ON u.university_id = un.university_id
  LEFT JOIN faculty AS f
  ON u.faculty_id = f.faculty_id
  LEFT JOIN department AS d
  ON u.department_id = d.department_id
  LEFT JOIN skills AS sk
  ON u.skills_id = sk.skills_id
  WHERE u.username = '${req.user.username}'`;
  connection.query(findUserInfo, (err, result) => {
    if (err) throw err;
    console.log(result[0]);
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
            let registerDate = moment(result[0].register_date).format("MMMM, YYYY");
            res.render('profile/settings', { user: result[0], date: registerDate, department, skill, university, faculty });
          })
        })

      })
    })

  })

}

export const getProfileShow = async (req, res, next) => {
  if(req.user) {
    if(req.user.username == req.params.id) {
      res.redirect('/profile');
    }
  }
  let findItems = `SELECT *
    FROM
    users AS u
    LEFT JOIN university AS un
    ON u.university_id = un.university_id
    LEFT JOIN faculty AS f
    ON u.faculty_id = f.faculty_id
    LEFT JOIN department AS d
    ON u.department_id = d.department_id
    LEFT JOIN skills AS sk
    ON u.skills_id = sk.skills_id
    LEFT JOIN sell_items AS s
    ON s.users_id = u.users_id
    LEFT JOIN (
    SELECT *
    FROM item_images
    WHERE item_images_id IN (
    SELECT MAX(item_images_id)
    FROM item_images
    GROUP BY sell_items_id
    )
    ) AS m ON s.sell_items_id = m.sell_items_id WHERE u.username = '${req.params.id}'`;
  connection.query(findItems, (err, result) => {
    if (err) throw err;
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
    ) AS m ON s.lodges_id = m.lodges_id WHERE u.username = '${req.params.id}'`;
    connection.query(findLodges, (err, result1) => {
      if(err) throw err;
      let registerDate = moment(result[0].register_date).format("MMMM, YYYY");
      res.render('profile/show', { user: result, date: registerDate, lodge: result1 });
    }) 
  })
}

export const putProfile = async (req, res, next) => {
  const {
    // username,
    // email,
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
  // if (username) user.username = username;
  // if (email) user.email = email;
  if (req.file) {
    // if (user.image.public_id) await cloudinary.v2.uploader.destroy(user.image.public_id);
    const { secure_url, public_id } = req.file;
    user.image = { secure_url, public_id };
    let data = { first_name: first_name, last_name: last_name, phone_number: phone, secure_image_url: secure_url, public_image_id: public_id, department_id: dep, skills_id: ski, university_id: uni, faculty_id: fac };
    let updateUser = `UPDATE users SET ? WHERE username = '${req.user.username}'`;
    connection.query(updateUser, data, (err, result2) => {
      if (err) throw err;
    });
  }
  let data = { first_name: first_name, last_name: last_name, phone_number: phone, department_id: dep, skills_id: ski, university_id: uni, faculty_id: fac };
  let updateUser = `UPDATE users SET ? WHERE username = '${req.user.username}'`;
  await user.save();
  await connection.query(updateUser, data, (err, result2) => {
    if (err) throw err;
  });
  const login = await util.promisify(req.login.bind(req));
  await login(user);
  req.flash('success', 'Profile successfully updated!');
  res.redirect(`/profile`);
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