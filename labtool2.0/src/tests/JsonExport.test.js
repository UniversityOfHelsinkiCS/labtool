import React from "react";
import { shallow } from "enzyme";
import { Button } from "semantic-ui-react";
import JsonExport from "../components/JsonExport";

describe("<JsonExport />", () => {
    const data = { a: 'a', b: [1, 2, 3] }
    const dataString = JSON.stringify(data, null, 4)

    let wrapper

    beforeEach(() => {
        wrapper = shallow(<JsonExport data={data} />)
    })
    
    describe("JsonExport component", () => {
        it("renders ok", () => {
            expect(wrapper).toBeDefined()
            expect(wrapper.find(Button).first().children().text()).toEqual("Export as JSON")
        })

        it("displays JSON correctly", () => {
            expect(wrapper.find("pre code").text()).toEqual(dataString)
        })

        it("can be clicked to open", () => {
            wrapper.find(Button).first().simulate('click')

            expect(wrapper.state('open')).toEqual(true)
        })
    })
})