//verificada
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle'
import styles from './styles/AboutAtPage.module.css'


const AboutAtPage = () => {
    useDocumentTitle('Acerca de EN S.A')
    return (
        <div className={styles.aboutAt} >
            {/* <p className={styles.aviso}>Aclaración: Todos los datos, imagenes e informacion que se encuentra en este sitio web son puramente de un entorno de desarrollo y pruebas. Excepto los links de redes y canales de contacto</p> */}
            <h1 >Conocé mis otros proyectos</h1>
            <a href="https://github.com/EstebanNunez99/"> Ir a GitHub</a>
            <h2 >Esteban Nuñez </h2>
            <Link to="/">
                <Button variant='primary'>Volver al Inicio</Button>
            </Link>
        </div>
    );
};

export default AboutAtPage;