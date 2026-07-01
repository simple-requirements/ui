import { useParams } from 'react-router';

export function ProjectOverviewPage() {
    const { projectId } = useParams();

    return (
        <section>
            <h1>Project</h1>
            <p>Dummy project overview for project {projectId}.</p>
        </section>
    );
}
