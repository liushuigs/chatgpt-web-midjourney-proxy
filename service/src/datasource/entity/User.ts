import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number

  @Column('text', { nullable: false })
    name: string

  @Column('text', { unique: true })
    token: string

  @Column('integer', { default: 0, unsigned: true })
    imageLimit: number
}
