import { useParams } from 'react-router';

export function ProjectRequirementsPage() {
    const { projectId } = useParams();

    return (
        <section>
            <h1>Requirements</h1>
            <p>Dummy requirements list for project {projectId}.</p>
        </section>
    );
}
