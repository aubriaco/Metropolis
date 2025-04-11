import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import L from "./Lang";
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";

export default class AboutPage extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            vehicleFees: {},
            applianceFees: {}
        };
    }

    componentDidMount() {
        qreq.get('/api/vehicle/fees', j => {
            if (j.item) {
                this.setState({ vehicleFees: j.item });
            }
        });
        qreq.get('/api/auction/appliance/fees', j => {
            if (j.item) {
                this.setState({ applianceFees: j.item });
            }
        });
    }

    render() {
        return <>
            <Helmet>
                <title>Bidea Online | {Globals.getLang('About Us')}</title>
            </Helmet><div className="container">
                <h1><L>Why Bidea?</L></h1>
                <div className="row justify-content-center mb-5">
                    <div className="col-md mt-5 p-3 bg-light">
                        <h4><L>Vehicle</L><br /><L>Auctions</L></h4>
                        <span><L>Participate in auctioning your modern enthusiast car - an array of fascinating and thrilling vehicles spanning from the 1980s to</L> {new Date().getFullYear()}.</span>
                        <br /><br />
                        <strong><L>Low Fees</L></strong><br />
                        <L>Buyers are subject to a commission of</L> {this.state.vehicleFees.buyersPercent}%, <L>with a maximum cap of</L> {Globals.formatter.format(this.state.vehicleFees.buyersMax)}. <L>Sellers can list their items without any charges and receive the entire sale price.</L><br />
                    </div>
                    <div className="col-md mt-5 p-3">
                        <h4><L>Article</L><br /><L>Auctions</L></h4>
                        <span><L>Experience the thrill of article auctions and discover unique items up for bidding, ranging from collectibles and antiques to modern gadgets and appliances.</L></span>
                        <br /><br />
                        <strong><L>Small Commission</L></strong><br />
                        <L>A commission of</L> {this.state.applianceFees.buyersPercent}% <L>will be deducted from the final bid.</L>
                    </div>
                    <div className="col-md mt-5 p-3 bg-light">
                        <h4><L>User-Friendly</L><br /><L>Experience</L></h4>
                        <span><L>We have introduced a range of innovative features that revolutionize the online buying and selling experience for enthusiast cars.</L></span>
                        <br /><br />
                        <strong><L>Helpful Links</L></strong><br />
                        <Link to="/signup"><L>Sign Up</L></Link><br />
                        <Link to="/login"><L>Login</L></Link><br />
                    </div>
                </div>
                <h1 className="mb-5 bg-light rounded"><L>About Us</L></h1>
                <div className="mb-5">
                    <p><L>Welcome to Bidea, the leading online platform for buying and selling remarkable vehicles. Our platform was developed by a team of automotive enthusiasts who are passionate about creating a seamless and exciting marketplace for car enthusiasts like you.</L></p>
                    <p><L>At Bidea, our mission is to provide a unique and enjoyable experience for both buyers and sellers. We understand the thrill of finding that perfect car or connecting with the right buyer for your vehicle. With this in mind, we have designed our platform to cater to the specific needs and desires of the automotive community.</L></p>
                    <p><L>Our marketplace features a diverse range of vehicles, including sports cars, sedans, SUVs, trucks, and more. Whether you're in search of a reliable daily driver or a rare collector's item, Bidea is the ultimate destination.</L></p>
                    <p><L>We take pride in offering a user-friendly interface that makes the buying and selling process a breeze. Our intuitive features make it easy for buyers to browse, search, and connect with sellers, while sellers benefit from a seamless listing process that helps showcase their vehicles to a wide and engaged audience.</L></p>
                    <p><L>Transparency and trust are fundamental to our platform. We prioritize open communication, ensuring that both buyers and sellers have access to accurate information and can make informed decisions. We strive to create a safe and secure environment where transactions can take place with confidence.</L></p>
                    <p><L>Bidea is more than just a marketplace; it is a vibrant community. We encourage enthusiasts to connect, share stories, and exchange knowledge. Our platform serves as a hub for like-minded individuals to come together and celebrate their shared love for automobiles.</L></p>
                    <p><L>Join us at Bidea and embark on an exciting journey in the world of automotive buying and selling. Experience the thrill of finding your dream car, connecting with fellow enthusiasts, and making successful transactions. We are committed to delivering an exceptional online marketplace and look forward to being a part of your automotive journey.</L></p>
                </div>
                <h1 className="mb-5 bg-light rounded"><L>How it Works</L></h1>
                <div className="mb-5">
                    <p><L>Welcome to Bidea, where buying and selling vehicles is made easy and convenient. Our platform connects buyers and sellers, providing a streamlined process for transactions. Here's a step-by-step guide on how it works:</L></p>
                    <ol>
                        <li><L>
                            <p><L>Create an Account:</L></p>
                            <ul>
                                <li><L>Sign up for a free account on Bidea.</L></li>
                                <li><L>Provide the required information to set up your profile.</L></li>
                                <li><L>Verify your account to gain access to all the platform features.</L></li>
                            </ul>
                        </L></li>
                        <li><L>
                            <p><L>Explore Listings:</L></p>
                            <ul>
                                <li><L> Browse through our extensive collection of vehicles listed for sale.</L></li>
                                <li><L> Utilize our search filters to narrow down your options based on make, model, price range, and other criteria.</L></li>
                                <li><L>Read detailed descriptions and view high-resolution photos to get a comprehensive understanding of each vehicle.</L></li>
                            </ul>
                        </L></li>
                        <li><L>
                            <p><L>Contact Sellers:</L></p>
                            <ul>
                                <li><L>Once you find a vehicle that catches your interest, use the provided contact information or the messaging feature to get in touch with the seller.</L></li>
                                <li><L>Ask questions, request additional information, and arrange for a viewing or test drive if necessary.</L></li>
                            </ul>
                        </L></li>
                        <li><L>
                            <p><L>Negotiate and Agree on Terms:</L></p>
                            <ul>
                                <li><L>Discuss the price and any other terms with the seller.</L></li>
                                <li><L>Negotiate a fair deal that satisfies both parties.</L></li>
                                <li><L>Ensure clear communication and agreement on payment, delivery, and other pertinent details.</L></li>
                            </ul>
                        </L></li>
                        <li><L>
                            <p><L>Complete the Transaction:</L></p>
                            <ul>
                                <li><L>Finalize the transaction by following the agreed-upon terms.</L></li>
                                <li><L>Make the payment using the preferred method as arranged with the seller.</L></li>
                                <li><L>If necessary, coordinate with the seller for vehicle transportation or pickup.</L></li>
                            </ul>
                        </L></li>
                        <li><L>
                            <p><L>Rate and Review:</L></p>
                            <ul>
                                <li><L>After the transaction is complete, provide feedback on your experience.</L></li>
                                <li><L>Rate the seller based on the accuracy of the listing, communication, and overall satisfaction.</L></li>
                            </ul>
                        </L></li>
                    </ol>
                    <p><L>Your reviews help maintain a trusted and reliable marketplace for all users.
                        Bidea facilitates a safe and secure environment for buying and selling vehicles. We recommend conducting due diligence, performing inspections, and ensuring clear communication with the seller to ensure a successful transaction.</L></p>
                    <p><L>Join Bidea today and experience a seamless and convenient way to buy and sell vehicles. We are dedicated to providing an exceptional user experience and look forward to being a part of your automotive journey.</L></p>
                </div>
            </div>
        </>;
    }
}