import React, { Component } from 'react';
import './App.css';

class Login extends Component {
    render() {
        return (
            <div className="App">
                <p>Kirjautumissivu</p>
                <form>
                    <div>
                    <label>
                         Käyttäjätunnus: <br />
                        <input type="text" class="form-control" name="name" />
                    </label>
                    </div>
                    <div>
                    <label>
                         Salasana: <br />
                        <input type="password" class="form-control" name="password" />
                    </label>
                    </div>
                    <input type="submit" value="Login" />
                </form>
            </div>
        );
    }
}

export default Login;
