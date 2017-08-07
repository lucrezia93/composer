/* tslint:disable:no-unused-variable */
/* tslint:disable:no-unused-expression */
/* tslint:disable:no-var-requires */
/* tslint:disable:max-classes-per-file */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import * as sinon from 'sinon';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AddIdentityComponent } from './add-identity.component';
import { ConnectionProfileService } from '../../services/connectionprofile.service';
import { IdentityCardService } from '../../services/identity-card.service';
import { AlertService } from '../../basic-modals/alert.service';

describe('AddIdentityComponent', () => {
    let sandbox;
    let component: AddIdentityComponent;
    let fixture: ComponentFixture<AddIdentityComponent>;

    let mockActiveModal;
    let mockConnectionProfileService;
    let mockIdCardService;
    let mockAlertService;

    beforeEach(() => {
        mockActiveModal = sinon.createStubInstance(NgbActiveModal);
        mockConnectionProfileService = sinon.createStubInstance(ConnectionProfileService);
        mockIdCardService = sinon.createStubInstance(IdentityCardService);
        mockAlertService = sinon.createStubInstance(AlertService);

        mockAlertService.successStatus$ = {next: sinon.stub()};
        mockAlertService.busyStatus$ = {next: sinon.stub()};
        mockAlertService.errorStatus$ = {next: sinon.stub()};

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [AddIdentityComponent],
            providers: [
                {provide: ConnectionProfileService, useValue: mockConnectionProfileService},
                {provide: AlertService, useValue: mockAlertService},
                {provide: IdentityCardService, useValue: mockIdCardService}
            ]
        })
        .compileComponents();

        sandbox = sinon.sandbox.create();
        fixture = TestBed.createComponent(AddIdentityComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be created', () => {
        expect(component).should.be.ok;
    });

    describe('#addIdentity', () => {

        it('should add an identity to the service and inform success', fakeAsync(() => {

            component['userId'] = 'bob';
            component['busNetName'] = 'bobNet';
            component['userId'] = 'bobId';
            component['userSecret'] = 'bobSecret';
            component['targetProfile'] = 'bobProfile';

            mockIdCardService.createIdentityCard.returns(Promise.resolve());

            let spy = sinon.spy(component.identityAdded, 'emit');

            component.addIdentity();

            tick();

            mockIdCardService.createIdentityCard.should.have.been.calledWith('bobId', 'bobNet', 'bobId', 'bobSecret', 'bobProfile');
            mockAlertService.successStatus$.next.should.have.been.calledWith({
                                title: 'ID Card Added',
                                text: 'The ID card was successfully added to My Wallet.',
                                icon: '#icon-role_24'
                            });
            spy.should.have.been.calledWith({success: true});
        }));

        it('should handle an error and inform the user', fakeAsync(() => {
            mockIdCardService.createIdentityCard.returns(Promise.reject('test error'));
            let spy = sinon.spy(component.identityAdded, 'emit');

            component.addIdentity();

            tick();

            component['addInProgress'].should.be.false;
            mockAlertService.errorStatus$.next.should.have.been.calledWith('test error');
            spy.should.have.been.calledWith({success: false});
        }));
    });

    describe('#validContents', () => {

        it('should not enable validation if trying to set certificates', () => {
            // Certs path
            component['useCerts'] = true;
            component['validContents']().should.be.false;
        });

        it('should not validate if a userID field is empty when specifying user ID/Secret', () => {
            // Secret/ID path
            component['useCerts'] = false;
            component['addInProgress'] = false;
            component['userId'] = null;
            component['userSecret'] = 'mySecret';
            component['busNetName'] = 'myName';

            component['validContents']().should.be.false;
        });

        it('should not validate if a userSecret field is empty when specifying user ID/Secret', () => {
            // Secret/ID path
            component['useCerts'] = false;
            component['addInProgress'] = false;
            component['userId'] = 'myID';
            component['userSecret'] = null;
            component['busNetName'] = 'myName';

            component['validContents']().should.be.false;
        });

        it('should validate if a Business Network Name field is empty when specifying user ID/Secret', () => {
            // Secret/ID path
            component['useCerts'] = false;
            component['addInProgress'] = false;
            component['userId'] = 'myID';
            component['userSecret'] = 'mySecret';
            component['busNetName'] = null;

            component['validContents']().should.be.true;
        });

        it('should validate if all text fields are added when specifying user ID/Secret', () => {
            // Secret/ID path
            component['useCerts'] = false;
            component['addInProgress'] = false;
            component['userId'] = 'myID';
            component['userSecret'] = 'mySecret';
            component['busNetName'] = 'myName';

            component['validContents']().should.be.true;
        });
    });

    describe('#useCertificates', () => {
        it('should set flag to false when passed false', () => {
            component['useCertificates'](false);
            component['useCerts'].should.be.false;
        });

        it('should set flag to true when passed true', () => {
            component['useCertificates'](true);
            component['useCerts'].should.be.true;
        });
    });

    describe('#close', () => {
        it('should emit on close', () => {
            let spy = sinon.spy(component.cancelAdd, 'emit');
            component['close']();
            spy.should.have.been.calledWith(true);
        });
    });
});