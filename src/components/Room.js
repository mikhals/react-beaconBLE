import React, { Component } from 'react'

export class Room extends Component {

    state = {
        width:100,
        height:100,
    }

    componentDidMount(){
        let {width,height} = this.props.room;
        this.setState({
            width,
            height,
        })
    }

    render() {
        return (
            <div style={{backgroundColor: '#eee', height:this.state.height, width:this.state.width}} >
                
            </div>
        )
    }
}

export default Room
