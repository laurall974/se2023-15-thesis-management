import {useContext, useEffect, useState} from "react";
import NavbarContainer from "../components/Navbar";
import TitleBar from "../components/TitleBar";

import {useNavigate, useParams} from "react-router-dom";
import { getProposalById } from "../api/ProposalsAPI";
import {Alert, Badge, Button, Card, Col, Container, Row} from "react-bootstrap";
import ApplicationButton from './ApplicationButton';

import "../ProposalDetails.css";
import { VirtualClockContext } from "../components/VirtualClockContext";

function ProposalDetailsPage() {
    const navigate = useNavigate();

    const { proposal_id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [proposal, setProposal] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const { currentDate } = useContext(VirtualClockContext);

    useEffect(() => {
        setIsLoading(true);

        getProposalById(proposal_id)
            .then(async res => {
                let data = await res.json()

                if(res.status === 200) {
                    setProposal(data);
                } else {
                    setErrorMessage(data.error)
                }

                setIsLoading(false)
            })
            .catch(err => {
                setErrorMessage(err.message);
                setIsLoading(false);
            });
    }, [proposal_id]);

    return (
        <>
            <NavbarContainer/>
            <TitleBar title={"Proposal Details"}/>
            {
                isLoading ? (<Alert variant="info">Loading...</Alert>) : (
                    errorMessage ? (
                        <Container>
                            <Row>
                                <Col>
                                    <Alert variant="danger">{errorMessage}</Alert>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button variant={"secondary"} onClick={() => navigate("/proposals")}>Back to Search Proposals</Button>
                                </Col>
                            </Row>
                        </Container>
                    ) : ( proposal &&
                        <Container fluid={true} className={"proposal-details-container"}>
                            <Row>
                                <Col>
                                    <h2 className={"proposal-details-title"}>{proposal.title}</h2>
                                </Col>
                            </Row>
                            <Row>
                                <Col className={"proposal-details-keyword"}>
                                    {proposal.keywords.map((keyword) => <Badge bg={"secondary"} className="mr-1">{keyword}</Badge>)}
                                </Col>
                            </Row>
                            <Row>
                                <Col className={"proposal-details-expiration"}>
                                    {currentDate > proposal.expiration_date ? 
                                        <Badge bg={"danger"}>Expired on {new Date(proposal.expiration_date).toLocaleDateString("it-IT")}</Badge> :
                                        <Badge bg={"primary"}>Expires {new Date(proposal.expiration_date).toLocaleDateString("it-IT")}</Badge>
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Description</Card.Title>
                                            <Card.Text>{proposal.description}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Supervisor</Card.Title>
                                            <Card.Text>{proposal.supervisor_name} {proposal.supervisor_surname}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Proposal Programmes</Card.Title>
                                            <Card.Text>
                                                {proposal.programmes.map((programme) => <Badge className="mr-1">{programme.title_degree}</Badge>)}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Proposal Type</Card.Title>
                                            <Card.Text>{proposal.type}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Proposal Level</Card.Title>
                                            <Card.Text>{proposal.level}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Required Knowledge</Card.Title>
                                            <Card.Text>{proposal.required_knowledge}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Proposal Groups</Card.Title>
                                            <Card.Text>
                                                {proposal.groups.map((group) => <Badge className="mr-1">{group}</Badge>)}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Additional Notes</Card.Title>
                                            <Card.Text>{proposal.notes}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button className={"proposal-details-back"} variant={"secondary"} onClick={() => {
                                        navigate('/proposals')
                                    }}>Back to Search Proposal</Button>
                                </Col>
                                <Col className={"d-flex flex-row-revers"}>
                                    <ApplicationButton proposalID={proposal_id} 
                                        expirationDate={proposal.expiration_date} />
                                </Col>
                            </Row>
                        </Container>
                    )
                )
            }
        </>
    );
}

export default ProposalDetailsPage;