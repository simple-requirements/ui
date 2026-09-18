import { Button } from 'primereact/button';

type Props = Readonly<{ onContinueToLogin: () => void }>;

export function BootstrapAdministratorSuccessPanel({ onContinueToLogin }: Props) {
    return (
        <section
            className='ui-panel ui-panel--rounded ui-public-account__card ui-public-account__card--wide'
            aria-labelledby='bootstrap-complete-title'>
            <h1 id='bootstrap-complete-title'>Check your email</h1>
            <p
                className='ui-public-account__intro'
                role='status'>
                Initial Administrator registration was received. Verify the email address before signing in.
            </p>
            <Button
                className='ui-button ui-button--primary ui-button--public-account'
                type='button'
                label='Continue to sign in'
                onClick={onContinueToLogin}
            />
        </section>
    );
}
