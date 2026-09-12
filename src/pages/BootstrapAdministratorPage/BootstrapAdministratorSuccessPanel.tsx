import { Button } from 'primereact/button';

type Props = Readonly<{ onContinueToLogin: () => void }>;

export function BootstrapAdministratorSuccessPanel({ onContinueToLogin }: Props) {
    return (
        <section
            className='bootstrap-page__panel'
            aria-labelledby='bootstrap-complete-title'>
            <h1 id='bootstrap-complete-title'>Check your email</h1>
            <p role='status'>
                Initial Administrator registration was received. Verify the email address before signing in.
            </p>
            <Button
                type='button'
                label='Continue to sign in'
                onClick={onContinueToLogin}
            />
        </section>
    );
}
