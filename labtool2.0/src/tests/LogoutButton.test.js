import React from "react"
import { LogoutButton } from "../components/LogoutButton"
import { shallow } from "enzyme"

describe("<LogoutButton />", () => {
    let mockLogout
    let mockHistory

    let wrapper

    beforeEach(() => {
        mockLogout = jest.fn()
        mockHistory = {
            push: jest.fn()
        } 
        wrapper = shallow(<LogoutButton logout={mockLogout} history={mockHistory} />)
    })

    describe("Logout Button", () => {
        it("renders ok", () => {
            expect(wrapper).toBeDefined()
            expect(wrapper.children().text()).toEqual("Logout")
        })

        it("can be clicked to logout", () => {
            wrapper.simulate('click')

            expect(mockLogout).toHaveBeenCalled();
            expect(mockHistory.push).toHaveBeenCalled();
        })
    })
})