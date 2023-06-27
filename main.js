var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();

var pool = mysql.createPool({
    connectionLimit : 4,
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'watcha',
});

var addUser = function(name, password, email, callback){
    pool.getConnection(function(err, conn) {
        if(err) {
            conn.release();
            return;
        }

        var data = {name:name, password:password, email:email};

        var exec = conn.query('insert into user set ?', data, function(err, result) {
            conn.release();
            if(err){
                return;
            }
            console.log(result);
        });
    });
}

var authUser = function(email, password, callback) {
    pool.getConnection(function(err, conn) {
        if(err) {
            conn.release();
            return;
        }
        var columns = ['email', 'password'];
        var tablename = 'user';

        var exec = conn.query("select ?? from ?? where email = ? and password = ?",
            [columns, tablename, email, password], function(err, rows) {
                conn.release();
                console.log('대상SQL: ' + exec.sql);
            if(rows.length > 0) {
                callback(null, rows);
                return;
            } else {
                callback(null, null);
            }
        });
    });
}

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/singin', (req, res) => {
    res.sendFile(__dirname + '/public/sing_in.html');
});

app.get('/singup', (req, res) => {
    res.sendFile(__dirname + '/public/sing_up.html');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/singin', (req, res) => {
    var paramEmail = req.body.email;
    var paramPassword = req.body.password;

    if(pool){
        authUser(paramEmail, paramPassword, function(err, rows) {
            if(err) { throw err; }
            
            if(rows){
                var context = {paramEmail : paramEmail, paramPassword : paramPassword};
                res.render('login_success', context, function(err, html) {
                    if(err) { throw err; }
                    res.end(html);
                });
            } else {
                res.render('login_failed', '', function(err, html) {
                    if(err) { throw err; }
                    res.end(html);
                });
            }
        });
    } else {
        res.render('database_failed', '', function(err, html){
            if(err) { throw err; }
            res.end(html);
        });
    }
});

app.post('/singup', (req, res) => {
    var paramName = req.param('name');
    var paramEmail = req.param('email');
    var paramPassword = req.param('password');

    if(pool) {
        addUser(paramName, paramPassword, paramEmail), function(err, result) {
            if(err) { throw err; }

            if(result) {
                res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else {
                res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        }
    } else {
        res.render('database_failed', '', function(err, html){
            if(err) { throw err; }
            res.end(html);
        });
    } 

    res.render('singup_success', '', function(err, html) {
        if(err) { throw err; }
        res.end(html);
    });
});



app.use((req, res) => {
    res.sendFile(__dirname + "/404.html");
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});