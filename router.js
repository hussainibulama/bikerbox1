const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

class Router {
  constructor(app, db) {
    this.login(app, db);
    this.verifyAccount(app, db);
    this.UpdatePersonal(app, db);
    this.UpdatePassword(app, db);
    this.logout(app, db);
    this.isLoggedIn(app, db);
    this.fetchhistory(app, db);
    this.fetchhistories(app, db);
    this.DeleteCard(app, db);
  }
  login(app, db) {
    app.post("/login", (req, res) => {
      let username = req.body.username;
      let password = req.body.password;
      console.log(username, password);

      username = username.toLowerCase();
      let cols = [username];
      db.query(
        "SELECT * FROM biker WHERE username = ? LIMIT 1",
        cols,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data && data.length === 1) {
            bcrypt.compare(
              password,
              data[0].password,
              (bcryptErr, verified) => {
                if (verified) {
                  req.session.userID = data[0].id;
                  res.json({
                    success: true,
                    sessionID: data[0].id,
                    username: cols,
                    name: data[0].name,
                    state: data[0].state,
                    address: data[0].address,
                  });
                  return;
                } else {
                  res.json({
                    success: false,
                    msg: "invalid  password",
                  });
                  return;
                }
              }
            );
          } else {
            res.json({
              success: false,
              msg: "invalid username or password",
            });
            return;
          }
        }
      );
    });
  }
  verifyAccount(app, db) {
    app.post("/createbiker", (req, res) => {
      db.query(
        "INSERT INTO biker SET ?",
        {
          username: req.body.username,
          password: bcrypt.hashSync(req.body.password, 9),
        },
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            res.json({
              success: true,
              msg: "account Created",
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "you have an error with your form",
            });
            return;
          }
        }
      );
    });
  }
  UpdatePersonal(app, db) {
    app.post("/updatetracking", (req, res) => {
      db.query(
        "UPDATE requestpickup SET status='" +
          req.body.status +
          "' WHERE trackingnumber = ?",
        req.body.trackingnumber,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            res.json({
              success: true,
              msg: "Updated Successfully",
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "server error, try later",
            });
            return;
          }
        }
      );
    });
  }
  UpdatePassword(app, db) {
    app.post("/assign", (req, res) => {
      let trackingid = req.body.trackingid;
      db.query(
        "UPDATE requestpickup SET bikerinfo='" +
          req.body.biker +
          "' WHERE trackingnumber= ?",
        trackingid,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "an error occured, please try again later",
            });
            return;
          }
          if (data) {
            res.json({
              success: true,
              msg: "Assign Successful",
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "server error, try later",
            });
            return;
          }
        }
      );
    });
  }

  logout(app, db) {
    app.post("/logout", (req, res) => {
      if (req.session.userID) {
        req.session.destroy();
        res.json({
          success: true,
        });

        return;
      } else {
        res.json({
          success: false,
        });
        return;
      }
    });
  }
  isLoggedIn(app, db) {
    app.post("/isLoggedIn", (req, res) => {
      if (req.session.userID) {
        let cols = [req.session.userID];
        db.query(
          "SELECT * FROM biker WHERE id = ? LIMIT 1",
          cols,
          (err, data, fields) => {
            if (data && data.length === 1) {
              res.json({
                success: true,
                username: data[0].username,
              });
              return true;
            } else {
              res.json({
                success: false,
              });
            }
          }
        );
      } else {
        res.json({
          success: false,
        });
      }
    });
  }
  fetchhistory(app, db) {
    app.post("/fetchpickup", (req, res) => {
      db.query(
        "SELECT * FROM requestpickup WHERE status != 'success' AND bikerinfo = ?",
        req.body.username,
        (err, data, fields) => {
          if (data) {
            res.end(JSON.stringify(data));
          } else {
            res.json({
              success: false,
              msg: "No data",
            });
          }
        }
      );
    });
  }
  fetchhistories(app, db) {
    app.post("/fetchpickuphistory", (req, res) => {
      let id = req.body.sessionID;
      db.query("SELECT * FROM requestpickup ", (err, data, fields) => {
        if (data) {
          res.end(JSON.stringify(data));
        } else {
          res.json({
            success: false,
            msg: "No data",
          });
        }
      });
    });
  }
  DeleteCard(app, db) {
    app.post("/fetchbikers", (req, res) => {
      let id = req.body.sessionID;
      db.query("SELECT username FROM biker ", (err, data, fields) => {
        if (data) {
          res.end(JSON.stringify(data));
        } else {
          res.json({
            success: false,
            msg: "No data",
          });
        }
      });
    });
  }
}
module.exports = Router;
