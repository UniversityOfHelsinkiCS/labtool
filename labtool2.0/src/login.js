import React, { Component } from 'react';
import './App.css';
import axios from 'axios'


class Login extends Component {

    render() {
        //const ii = login();
        return (
            <div className="App">
                <p>Kirjautumissivu</p>
                <form>
                    <div>
                        <label>
                            Käyttäjätunnus: <br />
                            <input type="text" className="form-control" name="name" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Salasana: <br />
                            <input type="password" className="form-control" name="password" />
                        </label>
                    </div>
                    <input type="submit" value="Login" />
                </form>
            </div>
        );
    }
}

export default Login;
